import { systemOptionsService } from "@/lib/services/systemOptionsService";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ListDashboardClient from "./ListDashboardClient";
import { Logo } from "@/components/Logo";
import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material";

export const metadata = {
  title: "Manage Configurable Lists | Admin Dashboard",
  description: "Configure positions, levels, and scholarship categories in the Memorias portal.",
};

export default async function AdminListsPage() {
  const session = await auth();
  if (!session?.user?.active || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all options using systemOptionsService
  const allOptions = await systemOptionsService.getAllOptions();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Premium Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backdropFilter: "blur(8px)",
          bgcolor: "background.paper",
          opacity: 0.95,
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LinkButton 
              href="/admin/users"
              variant="outlined"
              size="small"
              sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 3 }}
            >
              Manage Users
            </LinkButton>
            <LinkButton 
              href="/"
              variant="contained"
              color="primary"
              size="small"
              sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 3 }}
            >
              Portal Home
            </LinkButton>
          </Box>
        </Container>
      </Box>

      {/* Main Admin Content */}
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        <Grid container spacing={4}>
          {/* Left Intro Panel */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }} elevation={0}>
              <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: 950, color: "primary.main", mb: 2 }}>
                Configurable Lists
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define, configure, and maintain allowed metadata choices used in the database. Only Admins can edit options.
              </Typography>
              <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "secondary.main", letterSpacing: "0.5px", display: "block", mb: 0.5 }}>
                  Usage Integrity Enabled
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  If an option in use is deleted, the system forces a bulk reassignment or clear action to maintain data integrity.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Dynamic Config Panel */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            <ListDashboardClient initialOptions={allOptions} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
