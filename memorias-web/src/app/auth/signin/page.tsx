import React from "react";
import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="material-card w-full max-w-md space-y-8 py-10 px-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary/5 rounded-2xl border border-primary/10">
            <svg viewBox="0 0 100 100" className="w-12 h-12">
              <circle cx="50" cy="50" r="15" fill="none" stroke="var(--secondary)" strokeWidth="8" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="var(--secondary)" strokeWidth="6" strokeDasharray="10 8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-primary dark:text-white">MEMORIAS</h1>
            <p className="text-xs text-muted font-medium tracking-wider uppercase">Research Lab Management</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-center text-muted">
            Sign in to manage your profile, publications, theses, and scholarships.
          </p>

          {/* Social Sign-In buttons (using Server Actions) */}
          <div className="space-y-3 pt-4">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-lg bg-surface hover:bg-surface-hover text-sm font-semibold text-foreground transition-all cursor-pointer shadow-sm hover:shadow"
              >
                {/* Simple SVG GitHub Icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                Continue with GitHub
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-lg bg-surface hover:bg-surface-hover text-sm font-semibold text-foreground transition-all cursor-pointer shadow-sm hover:shadow"
              >
                {/* Simple SVG Google Icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 pt-6 border-t border-dashed border-border/85 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-base animate-pulse">🚧</span>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest block text-center">
                  Local Dev Backdoor
                </span>
              </div>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const email = (formData.get("email") as string) || "admin@example.com";
                  const role = (formData.get("role") as string) || "ADMIN";
                  await signIn("credentials", { email, role, redirectTo: "/" });
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                    Dev Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue="admin@example.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                    Dev Role
                  </label>
                  <select
                    name="role"
                    defaultValue="ADMIN"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="USER">USER (Pending)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
                >
                  Dev Backdoor Login
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Security / Approval Warning Notice */}
        <div className="pt-6 border-t border-border bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg flex gap-3 text-xs text-muted leading-relaxed">
          <span className="text-lg">🛡️</span>
          <div>
            <span className="font-bold text-foreground block mb-0.5">Admin Approval Required</span>
            To protect lab confidentiality, first-time sign-ins are held in a pending queue. A system administrator must review and activate your account before you can edit data.
          </div>
        </div>
      </div>
    </div>
  );
}
