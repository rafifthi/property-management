"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadLocalUser, signOutLocal, type LocalUser } from "@/lib/local-auth";

export type { LocalUser };

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
  // The Supabase browser client only exists in the browser; creating it here
  // (not in the render body) keeps prerender/SSR from touching it.
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    let active = true;

    // Local fallback: no Supabase configured → read the local admin session.
    if (!isSupabaseConfigured()) {
      setUser(loadLocalUser());
      setLoading(false);
      return;
    }

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseBrowserClient();
    } catch (err) {
      console.error(err);
      setLoading(false);
      return;
    }
    supabaseRef.current = supabase;

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
  }, []);

  const signOut = async () => {
    if (supabaseRef.current) {
      await supabaseRef.current.auth.signOut();
    } else {
      signOutLocal();
    }
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
