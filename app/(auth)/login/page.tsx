"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { LOCAL_ADMIN_HINT, signInLocal } from "@/lib/local-auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const localMode = !isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Local fallback when Supabase isn't configured.
    if (!isSupabaseConfigured()) {
      if (!signInLocal(email, password)) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="auth-page">
      <Card className="auth-card !border-none !shadow-none">
        <CardHeader className="auth-header !pb-0">
          <div className="auth-logo">
            <Building2 size={20} />
            <span>Rentra</span>
          </div>
          <h3 className="text-lg font-bold mt-4 mb-1">Sign in</h3>
          <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {localMode && (
              <p className="text-xs text-muted-foreground rounded-md bg-muted px-3 py-2">
                Local mode — sign in with <span className="font-medium text-foreground">{LOCAL_ADMIN_HINT}</span>
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" placeholder="you@example.com" type="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" className="pl-9 pr-10" placeholder="Enter password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account? <Link href="/signup" className="text-primary font-medium">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
