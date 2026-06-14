"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const USERS_KEY = "rentra_users";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const raw = localStorage.getItem(USERS_KEY);
    const users: Record<string, { password: string; fullName: string; phone: string }> = raw ? JSON.parse(raw) : {};

    if (users[email]) {
      setError("An account with this email already exists");
      setLoading(false);
      return;
    }

    users[email] = { password, fullName: fullname, phone };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    router.push("/login");
  };

  return (
    <div className="auth-page">
      <Card className="auth-card !border-none !shadow-none">
        <CardHeader className="auth-header !pb-0">
          <div className="auth-logo">
            <Building2 size={20} />
            <span>Rentra</span>
          </div>
          <h3 className="text-lg font-bold mt-4 mb-1">Create account</h3>
          <p className="text-sm text-muted-foreground">Fill in your details to get started</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="fullname">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="fullname" className="pl-9" placeholder="Budi Prakoso" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="phone">Phone Number <span className="text-muted-foreground">(optional)</span></label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" className="pl-9" placeholder="+62 812-3456-7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" className="pl-9 pr-10" placeholder="At least 6 characters" type={showPassword ? "text" : "password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
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
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account? <Link href="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
