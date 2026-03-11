import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardFiltersDto } from '@/types/dashboard.type';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (params?: DashboardFiltersDto) => [...dashboardKeys.all, 'metrics', params] as const,
  trends: (params?: DashboardFiltersDto) => [...dashboardKeys.all, 'trends', params] as const,
  distributions: (params?: DashboardFiltersDto) =>
    [...dashboardKeys.all, 'distributions', params] as const,
};

export const useDashboardMetrics = (params?: DashboardFiltersDto) => {
  return useQuery({
    queryKey: dashboardKeys.metrics(params),
    queryFn: async () => {
      const response = await dashboardService.getMetrics(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useDashboardTrends = (params?: DashboardFiltersDto) => {
  return useQuery({
    queryKey: dashboardKeys.trends(params),
    queryFn: async () => {
      const response = await dashboardService.getTrends(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useDashboardDistributions = (params?: DashboardFiltersDto) => {
  return useQuery({
    queryKey: dashboardKeys.distributions(params),
    queryFn: async () => {
      const response = await dashboardService.getDistributions(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
