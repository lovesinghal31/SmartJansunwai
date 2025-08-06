import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  accessToken: string | null;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper to fetch user with current access token
  const fetchUser = async (token: string) => {
    const res = await fetch("/api/user", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  // Try to refresh access token
  const refreshAccessToken = async () => {
    const res = await fetch("/api/refresh", { method: "POST", credentials: "include" });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  };

  // On mount, try to get access token via refresh
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const token = await refreshAccessToken();
        if (cancelled) return;
        setAccessToken(token);
        const user = await fetchUser(token);
        if (cancelled) return;
        setUser(user);
        setError(null);
      } catch (err: any) {
        setUser(null);
        setAccessToken(null);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Set up auto-refresh for access token (every 14 minutes)
  useEffect(() => {
    if (!accessToken) return;
    if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    refreshTimeout.current = setTimeout(() => {
      refreshAccessToken().catch(() => {
        setAccessToken(null);
        setUser(null);
      });
    }, 14 * 60 * 1000);
    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [accessToken]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      setError(null);
      return data.user;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      setError(null);
      return data.user;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      setAccessToken(null);
      setUser(null);
      setError(null);
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
