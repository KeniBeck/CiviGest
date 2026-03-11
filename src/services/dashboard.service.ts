import { api } from './api';
import type {
  DashboardFiltersDto,
  DashboardMetrics,
  DashboardTrends,
  DashboardDistributions,
} from '@/types/dashboard.type';

class DashboardService {
  private readonly baseUrl = '/dashboard';

  async getMetrics(params?: DashboardFiltersDto) {
    const response = await api.get<DashboardMetrics>(`${this.baseUrl}/metrics`, { params });
    return response;
  }

  async getTrends(params?: DashboardFiltersDto) {
    const response = await api.get<DashboardTrends>(`${this.baseUrl}/trends`, { params });
    return response;
  }

  async getDistributions(params?: DashboardFiltersDto) {
    const response = await api.get<DashboardDistributions>(`${this.baseUrl}/distributions`, { params });
    return response;
  }
}

export const dashboardService = new DashboardService();
