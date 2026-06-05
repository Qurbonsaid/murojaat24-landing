import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type Organization = {
  _id: string;
  name: string;
  governance: string;
};

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await apiRequest<Organization[]>("/api/organizations");
  return response.data;
};

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGovernance = () => {
  return useQuery({
    queryKey: ["governance"],
    queryFn: async () => {
      const organizations = await fetchOrganizations();
      const governanceSet = new Set<string>();
      organizations.forEach((org) => governanceSet.add(org.governance));
      return Array.from(governanceSet);
    },
    staleTime: 10 * 60 * 1000,
  });
};
