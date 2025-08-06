import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  accessToken?: string | null
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: url === "/api/refresh" || url === "/api/logout" ? "include" : undefined,
  });
  await throwIfResNotOk(res);
  return res;
}

// Helper to get access token from AuthContext
export function useAccessToken() {
  const { accessToken } = useAuth();
  return accessToken;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // You should use useAuth and pass accessToken manually for protected queries
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
