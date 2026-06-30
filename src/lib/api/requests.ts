import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./client";

export type RequestTimelineEntry = {
  status: string;
  timestamp: string;
  comment?: string | null;
};

export type TrackRequestResponse = {
  _id: string;
  requestNumber: string;
  status: string;
  statusLabel?: string;
  citizen?: { name: string; phone: string };
  organization?: { name: string; governance: string };
  description: string;
  address: {
    full: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  };
  assignment?: {
    estimatedTime?: string;
  };
  timeline: RequestTimelineEntry[];
  createdAt: string;
  images?: string[];
  rating?: {
    score?: number | null;
    comment?: string | null;
    ratedAt?: string | null;
  } | null;
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

export type RateRequestPayload = {
  id: string;
  phone?: string;
  telegramId?: number;
  otp?: string;
  score: number;
  comment?: string;
};

export const fetchTrackedRequest = async (requestNumber: string) => {
  const response = await apiRequest<TrackRequestResponse>(
    `/api/requests/track/${encodeURIComponent(requestNumber)}`,
  );

  return response.data;
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

export const useTrackRequest = (requestNumber?: string) => {
  return useQuery({
    queryKey: ["requestTrack", requestNumber],
    queryFn: async () => {
      return fetchTrackedRequest(requestNumber || "");
    },
    staleTime: 60_000,
    retry: false,
    enabled: false,
  });
};

export const useRateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: RateRequestPayload) => {
      const response = await apiRequest<TrackRequestResponse>(
        `/api/requests/${id}/rate`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["requestTrack", data.requestNumber],
      });
      await queryClient.invalidateQueries({ queryKey: ["public-statistics"] });
    },
  });
};
