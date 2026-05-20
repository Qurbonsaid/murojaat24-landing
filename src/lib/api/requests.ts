import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type RequestTimelineEntry = {
  status: string;
  timestamp: string;
  comment?: string | null;
};

export type TrackRequestResponse = {
  requestNumber: string;
  status: string;
  statusLabel?: string;
  citizen?: { name: string; phone: string };
  organization?: { name: string; governance: string };
  description: string;
  address: {
    full: string;
  };
  timeline: RequestTimelineEntry[];
  createdAt: string;
  images?: string[];
};

export type CreateCitizenRequestPayload = {
  citizenName: string;
  citizenPhone?: string;
  otp?: string;
  telegramId?: number;
  organization?: string;
  description: string;
  address: {
    full: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  };
  images?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
};

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest<{ expiresIn: number }>(
        "/api/requests/request-otp",
        {
          method: "POST",
          body: JSON.stringify({ phone }),
        },
      );

      return response.data;
    },
  });
};

export const useCreateCitizenRequest = () => {
  return useMutation({
    mutationFn: async (payload: CreateCitizenRequestPayload) => {
      const response = await apiRequest<{
        requestNumber: string;
        status: string;
        organization?: { name: string; governance: string };
        citizen: { name: string; phone: string; telegramId?: number };
      }>("/api/requests/citizen", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return response.data;
    },
  });
};

export const useTrackRequest = () => {
  return useMutation({
    mutationFn: async (requestNumber: string) => {
      const encoded = encodeURIComponent(requestNumber.trim());
      const response = await apiRequest<TrackRequestResponse>(
        `/api/requests/track/${encoded}`,
      );

      return response.data;
    },
  });
};
