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
 * Gets today's date in YYYY-MM-DD format.
 */
export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

/**
 * Parses duration count and unit from plan info.
 */
export function parsePlanDuration(
  duration?: string | number | null,
  durationUnit?: string | null,
  planIdentifier?: string | null
): { count: number; unit: 'days' | 'weeks' | 'months' | 'years' } {
  let unit: 'days' | 'weeks' | 'months' | 'years' = 'months';
  const rawUnit = (durationUnit || '').toLowerCase();
  if (rawUnit.includes('year') || rawUnit.includes('yr')) unit = 'years';
  else if (rawUnit.includes('day')) unit = 'days';
  else if (rawUnit.includes('week')) unit = 'weeks';
  else if (rawUnit.includes('month') || rawUnit.includes('mo')) unit = 'months';

  let count: number | null = null;
  if (typeof duration === 'number') {
    count = duration;
  } else if (typeof duration === 'string') {
    const rawDuration = duration.toLowerCase();
    if (rawDuration.includes('year') || rawDuration.includes('yr')) unit = 'years';
    else if (rawDuration.includes('day')) unit = 'days';
    else if (rawDuration.includes('week')) unit = 'weeks';
    else if (rawDuration.includes('month') || rawDuration.includes('mo')) unit = 'months';

    const match = duration.match(/\d+/);
    if (match) {
      count = parseInt(match[0], 10);
    }
  }

  if (count === null || isNaN(count) || count <= 0) {
    const id = (planIdentifier || '').toLowerCase();
    if (id.includes('yearly') || id.includes('annual') || id.includes('12 month')) {
      count = 12;
      unit = 'months';
    } else if (id.includes('half') || id.includes('6 month') || id.includes('semi')) {
      count = 6;
      unit = 'months';
    } else if (id.includes('quarter') || id.includes('3 month')) {
      count = 3;
      unit = 'months';
    } else if (id.includes('day') || id.includes('daily')) {
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
 * Calculates membership expiry date from start date and plan duration.
 */
export function calculateExpiryDate(
  startDateStr: string,
  duration?: string | number | null,
  durationUnit?: string | null,
  planIdentifier?: string | null
): string {
  const baseDateStr = isValidDateString(startDateStr) ? startDateStr : getTodayDateString();
  const [yearStr, monthStr, dayStr] = baseDateStr.split('-');
  const startYear = parseInt(yearStr, 10);
  const startMonth = parseInt(monthStr, 10);
  const startDay = parseInt(dayStr, 10);

  const { count, unit } = parsePlanDuration(duration, durationUnit, planIdentifier);

  let targetDate: Date;

  if (unit === 'months' || unit === 'years') {
    const totalMonthsToAdd = unit === 'years' ? count * 12 : count;
    const targetMonthIndex = (startMonth - 1) + totalMonthsToAdd;
    const targetYear = startYear + Math.floor(targetMonthIndex / 12);
    const targetMonth = ((targetMonthIndex % 12) + 12) % 12;

    const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const clampedDay = Math.min(startDay, maxDaysInTargetMonth);

    targetDate = new Date(targetYear, targetMonth, clampedDay);
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (unit === 'weeks') {
    targetDate = new Date(startYear, startMonth - 1, startDay);
    targetDate.setDate(targetDate.getDate() + (count * 7) - 1);
  } else {
    targetDate = new Date(startYear, startMonth - 1, startDay);
    targetDate.setDate(targetDate.getDate() + count - 1);
  }

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
