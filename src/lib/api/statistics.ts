import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type PublicStatisticsOverview = {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
  verified: number;
  rejected: number;
  today: number;
  thisMonth: number;
};

export type PublicStatisticsStatusItem = {
  status: string;
  label: string;
  count: number;
  color: string;
};

export type PublicStatisticsOrganizationItem = {
  organizationId: string;
  name: string;
  governance: string;
  count: number;
  color: string;
};

export type PublicStatisticsDailyItem = {
  date: string;
  received: number;
  completed: number;
};

export type PublicStatistics = {
  overview: PublicStatisticsOverview;
  statusDistribution: PublicStatisticsStatusItem[];
  governanceDistribution: Array<{
    governance: string;
    count: number;
    color: string;
  }>;
  organizationDistribution: PublicStatisticsOrganizationItem[];
  dailyTrend: PublicStatisticsDailyItem[];
  updatedAt: string;
};

export const fetchPublicStatistics = async (): Promise<PublicStatistics> => {
  const response = await apiRequest<PublicStatistics>("/api/statistics/public");

  return response.data;
};

export const usePublicStatistics = () => {
  return useQuery({
    queryKey: ["public-statistics"],
    queryFn: fetchPublicStatistics,
    staleTime: 5 * 60 * 1000,
  });
};
