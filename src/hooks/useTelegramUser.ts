import { useMemo } from "react";

/**
 * Check if we're running in Telegram Mini App context.
 * Looks for Telegram-specific data without calling TMA SDK hooks.
 */
const isRunningInTelegram = (): boolean => {
  try {
    // Check URL hash for Telegram Mini App indicators
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const hash = window.location.hash;

      // Telegram passes data in URL hash or as query params
      if (
        hash.includes("tgWebAppData") ||
        url.searchParams.get("tgWebAppData") ||
        hash.includes("tgWebAppVersion")
      ) {
        return true;
      }

      // Check if localStorage has Telegram data
      try {
        const stored = window.localStorage.getItem("tgWebAppData");
        if (stored) return true;
      } catch (e) {
        // localStorage might not be accessible
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Hook to extract Telegram user information from launch params.
 * Safely handles the case when running outside Telegram.
 */
export const useTelegramUser = (): {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
} | null => {
  return useMemo(() => {
    if (!isRunningInTelegram()) return null;

    try {
      // Only import and use TMA SDK if we're actually in Telegram
      const tgWebAppData = window.localStorage.getItem("tgWebAppData");
      if (!tgWebAppData) return null;

      const data = JSON.parse(tgWebAppData);
      if (data?.user) return data.user;
      return null;
    } catch (error) {
      return null;
    }
  }, []);
};

/**
 * Hook to check if the app is running in Telegram Mini App context.
 */
export const useTelegramContext = (): boolean => {
  return useMemo(() => isRunningInTelegram(), []);
};
