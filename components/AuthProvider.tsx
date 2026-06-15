"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface LocalUser {
  email: string;
  fullName: string;
  phone: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

function toLocalUser(user: User | null | undefined): LocalUser | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name as string) ?? (meta.fullName as string) ?? "";
  return {
    email: user.email ?? "",
    fullName: fullName || (user.email ?? ""),
    phone: (meta.phone as string) ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toLocalUser(data.session?.user));
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toLocalUser(session?.user));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
