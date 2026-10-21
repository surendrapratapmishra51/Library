import { MembershipPlan } from '../types';

/**
 * Validates whether a date string is in YYYY-MM-DD format and is a real calendar date.
 */
export function isValidDateString(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * Formats a Date object to YYYY-MM-DD without timezone shift.
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in YYYY-MM-DD format using local time.
 */
export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

/**
 * Parses duration count and unit from a MembershipPlan or duration string.
 */
export function parsePlanDuration(
  plan: Partial<MembershipPlan> | null | undefined
): { count: number; unit: 'days' | 'weeks' | 'months' | 'years' } {
  if (!plan) {
    return { count: 1, unit: 'months' };
  }

  // 1. Check durationUnit property if provided
  const rawUnit = (plan.durationUnit || '').toLowerCase();
  let unit: 'days' | 'weeks' | 'months' | 'years' = 'months';
  if (rawUnit.includes('year') || rawUnit.includes('yr')) unit = 'years';
  else if (rawUnit.includes('day')) unit = 'days';
  else if (rawUnit.includes('week')) unit = 'weeks';
  else if (rawUnit.includes('month') || rawUnit.includes('mo')) unit = 'months';

  // 2. Extract numeric count from plan.duration
  let count: number | null = null;
  if (typeof plan.duration === 'number') {
    count = plan.duration;
  } else if (typeof plan.duration === 'string') {
    const rawDuration = plan.duration.toLowerCase();
    // Detect unit from duration string if durationUnit was ambiguous
    if (rawDuration.includes('year') || rawDuration.includes('yr')) unit = 'years';
    else if (rawDuration.includes('day')) unit = 'days';
    else if (rawDuration.includes('week')) unit = 'weeks';
    else if (rawDuration.includes('month') || rawDuration.includes('mo')) unit = 'months';

    const match = plan.duration.match(/\d+/);
    if (match) {
      count = parseInt(match[0], 10);
    }
  }

  // 3. Fallback based on plan ID or Name if count could not be extracted
  if (count === null || isNaN(count) || count <= 0) {
    const identifier = `${plan.id || ''} ${plan.name || ''}`.toLowerCase();
    if (identifier.includes('yearly') || identifier.includes('annual') || identifier.includes('12 month')) {
      count = 12;
      unit = 'months';
    } else if (identifier.includes('half') || identifier.includes('6 month') || identifier.includes('semi')) {
      count = 6;
      unit = 'months';
    } else if (identifier.includes('quarter') || identifier.includes('3 month')) {
      count = 3;
      unit = 'months';
    } else if (identifier.includes('day') || identifier.includes('daily')) {
      count = 1;
      unit = 'days';
    } else {
      count = 1;
      unit = 'months';
    }
  }

  return { count, unit };
}

/**
 * Calculates the membership expiry date based on the start date and membership plan duration.
 *
 * Follows the library application convention:
 * - A 1-month plan starting on 19 October 2026 expires on 18 November 2026.
 * - A 3-month plan starting on 19 October 2026 expires on 18 January 2027.
 * - A 6-month plan starting on 19 October 2026 expires on 18 April 2027.
 * - A 1-year (12-month) plan starting on 19 October 2026 expires on 18 October 2027.
 * - A 30-day plan starting on 19 October 2026 expires on 17 November 2026 (+30 days minus 1 day).
 */
export function calculateExpiryDate(
  startDateStr: string,
  plan: Partial<MembershipPlan> | null | undefined
): string {
  // Fallback to today if invalid start date
  const baseDateStr = isValidDateString(startDateStr) ? startDateStr : getTodayDateString();
  const [yearStr, monthStr, dayStr] = baseDateStr.split('-');
  const startYear = parseInt(yearStr, 10);
  const startMonth = parseInt(monthStr, 10); // 1 to 12
  const startDay = parseInt(dayStr, 10);

  const { count, unit } = parsePlanDuration(plan);

  let targetDate: Date;

  if (unit === 'months' || unit === 'years') {
    const totalMonthsToAdd = unit === 'years' ? count * 12 : count;
    const targetMonthIndex = (startMonth - 1) + totalMonthsToAdd;
    const targetYear = startYear + Math.floor(targetMonthIndex / 12);
    const targetMonth = ((targetMonthIndex % 12) + 12) % 12;

    // Clamp day to max days in target month (e.g. 31 Jan + 1 mo => 28 Feb)
    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const clampedDay = Math.min(startDay, maxDaysInTargetMonth);

    targetDate = new Date(targetYear, targetMonth, clampedDay);
    // Subtract 1 day according to the standard membership cycle convention
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (unit === 'weeks') {
    const totalDays = count * 7;
    targetDate = new Date(startYear, startMonth - 1, startDay);
    targetDate.setDate(targetDate.getDate() + totalDays - 1);
  } else {
    // Days
    targetDate = new Date(startYear, startMonth - 1, startDay);
    targetDate.setDate(targetDate.getDate() + count - 1);
  }

  // Fallback guard: Expiry date must not be before start date
  const startDate = new Date(startYear, startMonth - 1, startDay);
  if (targetDate < startDate) {
    targetDate = new Date(startDate);
  }

  return formatDateToISO(targetDate);
}

/**
 * Validates that expiryDate is strictly later than startDate.
 */
export function isExpiryDateValid(startDateStr: string, expiryDateStr: string): boolean {
  if (!isValidDateString(startDateStr) || !isValidDateString(expiryDateStr)) {
    return false;
  }
  return expiryDateStr > startDateStr;
}
