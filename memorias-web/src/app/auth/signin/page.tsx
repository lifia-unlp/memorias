import React from "react";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function SignInPage() {
  const logoSetting = await (prisma as any).systemSetting
    ?.findUnique({ where: { key: "logo_url" } })
    .catch(() => null);
  const logoUrl = logoSetting?.value || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="material-card w-full max-w-md space-y-8 py-10 px-8">
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-400 italic">
              (your logo here)
            </span>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-center text-muted">
            Sign in to manage your profile, publications, theses, and scholarships.
          </p>

          {/* Social Sign-In buttons (using Server Actions) */}
          <div className="space-y-3 pt-4">
            {(() => {
              const isGitHubConfigured = !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
              const isGoogleConfigured = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
              const isMicrosoftConfigured = !!(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET);
              const isOrcidConfigured = !!(process.env.AUTH_ORCID_ID && process.env.AUTH_ORCID_SECRET);
              const hasAnyProvider = isGitHubConfigured || isGoogleConfigured || isMicrosoftConfigured || isOrcidConfigured;

              if (!hasAnyProvider) {
                return (
                  <div className="text-center p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium space-y-1">
                    <span className="text-lg">⚠️</span>
                    <p className="font-semibold">No Login Providers Configured</p>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Please check that your `.env` configuration file contains a valid `AUTH_SECRET` and at least one enabled OAuth provider (Google, GitHub, or Microsoft).
                    </p>
                  </div>
                );
              }

              return (
                <>
                  {isGitHubConfigured && (
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
                  )}

                  {isGoogleConfigured && (
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
                  )}

                  {isMicrosoftConfigured && (
                    <form
                      action={async () => {
                        "use server";
                        await signIn("microsoft-entra-id", { redirectTo: "/" });
                      }}
                    >
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-lg bg-surface hover:bg-surface-hover text-sm font-semibold text-foreground transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        {/* Microsoft SVG Icon */}
                        <svg viewBox="0 0 23 23" className="w-5 h-5 flex-shrink-0">
                          <rect x="0" y="0" width="10" height="10" fill="#f25022" />
                          <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
                          <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
                          <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
                        </svg>
                        Continue with Microsoft
                      </button>
                    </form>
                  )}

                  {isOrcidConfigured && (
                    <form
                      action={async () => {
                        "use server";
                        await signIn("orcid", { redirectTo: "/" });
                      }}
                    >
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-lg bg-surface hover:bg-surface-hover text-sm font-semibold text-foreground transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        {/* ORCID brand logo */}
                        <svg viewBox="0 0 256 256" className="w-5 h-5 flex-shrink-0">
                          <path fill="#A6CE39" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"/>
                          <path fill="#FFF" d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-121c-5.7 0-10.4-4.7-10.4-10.4 0-5.7 4.7-10.4 10.4-10.4 5.8 0 10.4 4.7 10.4 10.4-.1 5.7-4.7 10.4-10.4 10.4zM189.4 133c0 30.6-21.6 54.4-53.9 54.4H101V79.1h35.3c31.4 0 53.1 22.1 53.1 53.9zm-73 40.5h18.2c22.1 0 37.7-14.7 37.7-40.5s-15.6-40.5-37.7-40.5h-18.2v81z"/>
                        </svg>
                        Continue with ORCID
                      </button>
                    </form>
                  )}
                </>
              );
            })()}
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
