import { useLaunchParams } from "@tma.js/sdk-react";

/**
 * Hook to extract Telegram user information from launch params.
 * Uses only `useLaunchParams(true)` per request.
 */
export const useTelegramUser = ():
  | ReturnType<typeof useLaunchParams>["tgWebAppData"]["user"]
  | null => {
  const launch = useLaunchParams(true);
  if (!launch) return null;
  if (!launch.tgWebAppData) return null;
  if (!launch.tgWebAppData.user) return null;
  return launch.tgWebAppData.user;
};

/**
 * Hook to check if the app is running in Telegram Mini App context.
 */
export const useTelegramContext = (): boolean => {
  const launch = useLaunchParams(true);
  return !!launch;
};
