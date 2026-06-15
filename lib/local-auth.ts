// Local-only auth fallback used when Supabase is not configured (e.g. local
// dev without env vars). Production with Supabase configured never hits this.
export interface LocalUser {
  email: string;
  fullName: string;
  phone: string;
}

const KEY = "rentra_local_user";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password";

export const LOCAL_ADMIN_USER: LocalUser = {
  email: ADMIN_EMAIL,
  fullName: "Admin",
  phone: "",
};

export function signInLocal(email: string, password: string): LocalUser | null {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(LOCAL_ADMIN_USER));
    }
    return LOCAL_ADMIN_USER;
  }
  return null;
}

export function loadLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function signOutLocal() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY);
  }
}

export const LOCAL_ADMIN_HINT = `${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`;
