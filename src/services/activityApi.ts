/**
 * Activity Log API Service
 * Handles fetching recent library administrative and member activity feeds.
 */

import { apiClient } from './apiClient';
import { ActivityItem } from '../types';

export const activityApi = {
  /**
   * Fetch recent audit/activity log items.
   */
  getActivities: async (): Promise<ActivityItem[]> => {
    return apiClient.get<ActivityItem[]>('/api/activities');
  },
};

export default activityApi;
