import React from "react";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const error = typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : undefined;
  const logoSetting = await prisma.systemSetting
    .findUnique({ where: { key: "logo_url" } })
    .catch(() => null);
  const logoUrl = logoSetting?.value || "";

  const requireActivationSetting = await prisma.systemSetting
    .findUnique({ where: { key: "require_user_activation" } })
    .catch(() => null);
  const requireUserActivation = requireActivationSetting?.value === "true";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 448,
          py: 5,
          px: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {/* Brand Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            (<img
              src={logoUrl}
              alt="Logo"
              style={{ height: 48, width: "auto", objectFit: "contain" }}
            />)
          ) : (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              (your logo here)
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error === "OAuthAccountNotLinked" && (
            <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
              <Typography component="span" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                Account exists under another method
              </Typography>
              An account with this email address is already registered using a different provider (such as Google or Microsoft). Please sign in using your original method.
            </Alert>
          )}

          {error && error !== "OAuthAccountNotLinked" && (
            <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
              <Typography component="span" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                Authentication Error
              </Typography>
              An error occurred during authentication. Please try again or contact support if the problem persists.
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{ textAlign: "center", color: "text.secondary" }}
          >
            Sign in to manage your profile, publications, theses, and scholarships.
          </Typography>

          {/* Social Sign-In buttons (using Server Actions) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 2 }}>
            {(() => {
              const isGitHubConfigured = !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
              const isGoogleConfigured = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
              const isMicrosoftConfigured = !!(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET);
              const isOrcidConfigured = !!(process.env.AUTH_ORCID_ID && process.env.AUTH_ORCID_SECRET);
              const hasAnyProvider = isGitHubConfigured || isGoogleConfigured || isMicrosoftConfigured || isOrcidConfigured;

              if (!hasAnyProvider) {
                return (
                  <Alert severity="warning" sx={{ fontSize: "0.75rem" }}>
                    <Typography component="span" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                      No Login Providers Configured
                    </Typography>
                    <Typography component="span" sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                      Please check that your `.env` configuration file contains a valid `AUTH_SECRET` and at least one enabled OAuth provider (Google, GitHub, or Microsoft).
                    </Typography>
                  </Alert>
                );
              }

              return (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {isOrcidConfigured && (
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "rgba(166,206,57,0.35)",
                        bgcolor: "rgba(166,206,57,0.05)",
                        borderRadius: 2,
                        p: 1.75,
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.625rem",
                          fontWeight: "bold",
                          color: "#A6CE39",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Recommended Option
                      </Typography>
                      <form
                        action={async () => {
                          "use server";
                          await signIn("orcid", { redirectTo: "/" });
                        }}
                      >
                        <button
                          type="submit"
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            padding: "12px 16px",
                            borderRadius: 8,
                            background: "#A6CE39",
                            border: "none",
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "#fff",
                            cursor: "pointer",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                            transition: "background 0.2s",
                          }}
                          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#96bd33"; }}
                          onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#A6CE39"; }}
                        >
                          <svg viewBox="0 0 256 256" style={{ width: 20, height: 20, flexShrink: 0 }}>
                            <path fill="#FFF" d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"/>
                            <path fill="#A6CE39" d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-121c-5.7 0-10.4-4.7-10.4-10.4 0-5.7 4.7-10.4 10.4-10.4 5.8 0 10.4 4.7 10.4 10.4-.1 5.7-4.7 10.4-10.4 10.4zM189.4 133c0 30.6-21.6 54.4-53.9 54.4H101V79.1h35.3c31.4 0 53.1 22.1 53.1 53.9zm-73 40.5h18.2c22.1 0 37.7-14.7 37.7-40.5s-15.6-40.5-37.7-40.5h-18.2v81z"/>
                          </svg>
                          Continue with ORCID
                        </button>
                      </form>
                    </Box>
                  )}

                  {isOrcidConfigured && (isGitHubConfigured || isGoogleConfigured || isMicrosoftConfigured) && (
                    <Divider sx={{ my: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: "0.625rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "text.disabled",
                        }}
                      >
                        Or Continue With
                      </Typography>
                    </Divider>
                  )}

                  {isGitHubConfigured && (
                    <form
                      action={async () => {
                        "use server";
                        await signIn("github", { redirectTo: "/" });
                      }}
                    >
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: "rgba(0,0,0,0.15)",
                          background: "transparent",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          transition: "background 0.2s",
                          color: "inherit",
                        }}
                      >
                        {/* Simple SVG GitHub Icon */}
                        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "currentColor" }}>
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
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: "rgba(0,0,0,0.15)",
                          background: "transparent",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          transition: "background 0.2s",
                          color: "inherit",
                        }}
                      >
                        {/* Simple SVG Google Icon */}
                        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
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
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid",
                          borderColor: "rgba(0,0,0,0.15)",
                          background: "transparent",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          transition: "background 0.2s",
                          color: "inherit",
                        }}
                      >
                        {/* Microsoft SVG Icon */}
                        <svg viewBox="0 0 23 23" style={{ width: 20, height: 20, flexShrink: 0 }}>
                          <rect x="0" y="0" width="10" height="10" fill="#f25022" />
                          <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
                          <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
                          <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
                        </svg>
                        Continue with Microsoft
                      </button>
                    </form>
                  )}
                </Box>
              );
            })()}
          </Box>

          {process.env.NODE_ENV === "development" && (
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: "1px dashed",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.625rem",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    color: "warning.main",
                    letterSpacing: "0.15em",
                    textAlign: "center",
                  }}
                >
                  Local Dev Backdoor
                </Typography>
              </Box>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const email = (formData.get("email") as string) || "admin@example.com";
                  const role = (formData.get("role") as string) || "ADMIN";
                  await signIn("credentials", { email, role, redirectTo: "/" });
                }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Dev Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue="admin@example.com"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "0.75rem",
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 8,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Dev Role
                  </label>
                  <select
                    name="role"
                    defaultValue="ADMIN"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "0.75rem",
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 8,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="USER">USER (Pending)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "#f59e0b",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    transition: "background 0.2s",
                  }}
                >
                  Dev Backdoor Login
                </button>
              </form>
            </Box>
          )}
        </Box>

        {/* Security / Approval Warning Notice */}
        <Paper
          variant="outlined"
          sx={{
            mt: 4,
            pt: 2,
            px: 2,
            pb: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(15,23,42,0.5)" : "grey.50",
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          {/* Shield SVG icon */}
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{ width: 20, height: 20, flexShrink: 0, mt: 0.25, color: "text.secondary" }}
            fill="currentColor"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            {requireUserActivation ? (
              <>
                <Typography component="span" sx={{ fontWeight: "bold", color: "text.primary", display: "block", mb: 0.5 }}>
                  Admin Approval Required
                </Typography>
                To protect lab confidentiality, first-time sign-ins are held in a pending queue. A system administrator must review and activate your account before you can edit data.
              </>
            ) : (
              <>
                <Typography component="span" sx={{ fontWeight: "bold", color: "text.primary", display: "block", mb: 0.5 }}>
                  Instant Account Activation
                </Typography>
                New accounts are automatically activated. You will receive immediate access with standard permissions upon signing in.
              </>
            )}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
