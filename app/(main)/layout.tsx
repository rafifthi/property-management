import { AuthProvider } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </AuthProvider>
  );
}
