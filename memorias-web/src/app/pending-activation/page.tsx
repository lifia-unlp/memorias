import React from "react";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default async function PendingActivationPage() {
  const session = await auth();

  // If not logged in, redirect to sign in safely
  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // If already active, redirect to home dashboard safely
  if (session.user.active) {
    redirect("/");
  }

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
          textAlign: "center",
          py: 6,
          px: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Animated hourglass / pending icon */}
        <Box
          sx={{
            mx: "auto",
            width: 80,
            height: 80,
            bgcolor: "secondary.main",
            opacity: 0.15,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid",
            borderColor: "secondary.main",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.15 },
              "50%": { opacity: 0.35 },
            },
            position: "relative",
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 24 24"
            sx={{
              width: 40,
              height: 40,
              color: "secondary.main",
              opacity: 1,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            fill="currentColor"
          >
            {/* Hourglass SVG path */}
            <path d="M6 2v6l4 4-4 4v6h12v-6l-4-4 4-4V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM8 7.5V4h8v3.5l-4 4-4-4z" />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
            Account Pending
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Waiting for Administrator Review
          </Typography>
        </Box>

        {/* User Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            textAlign: "left",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(15,23,42,0.5)" : "grey.50",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              (<img
                src={session.user.image}
                alt="Profile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid rgba(0,0,0,0.12)",
                  flexShrink: 0,
                }}
              />)
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  opacity: 0.1,
                  borderRadius: "50%",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  sx={{
                    width: 22,
                    height: 22,
                    color: "primary.main",
                    opacity: 1,
                    position: "absolute",
                  }}
                  fill="currentColor"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </Box>
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "text.primary" }}
              >
                {session.user.name || "Authenticated User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {session.user.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
          Your account was successfully created! However, before you can view lab analytics or edit resources, an administrator needs to activate your membership. You will receive access automatically once approved.
        </Typography>

        {/* Sign Out Action */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/signin" });
          }}
          style={{ paddingTop: 8 }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--mui-palette-secondary-main, #9c27b0)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          >
            Sign Out
          </button>
        </form>
      </Box>
    </Box>
  );
}
