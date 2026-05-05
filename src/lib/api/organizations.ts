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
