import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  user: {
    id: string;
    username: string;
    email?: string | null;
    role?: string | null;
  };
}

export function useAdminUser() {
  return useQuery<AuthUser | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Impossible de récupérer l'utilisateur connecté");
      }

      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
