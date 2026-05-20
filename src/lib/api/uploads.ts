import { apiRequest } from "./client";

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiRequest<{ urls: string[] }>("/api/uploads/images", {
    method: "POST",
    body: formData,
  });

  return response.data.urls;
};
