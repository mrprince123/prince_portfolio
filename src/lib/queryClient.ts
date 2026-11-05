import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Never retry if request failed due to unauthorized / session expiration
        if (
          error?.response?.status === 401 ||
          error?.status === 401 ||
          error?.message?.toLowerCase().includes("session expired") ||
          error?.message?.toLowerCase().includes("please sign in")
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
    },
  },
});

export function clearAdminCache() {
  queryClient.clear();
}
