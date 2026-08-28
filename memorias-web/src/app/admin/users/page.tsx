import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { adminUserService } from "@/lib/services/adminUserService";
import { RoleSelector, ActivationButton, DeleteUserButton, MemberSelector, BroadcastEmailButton, EmailUserButton, EditUserButton } from "./UserControls";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import {
  Container,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
} from "@mui/material";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  // Fetch all users and members for assignment using adminUserService
  const users = await adminUserService.getAllUsers();
  const members = await adminUserService.getMembersForUserAssignment();

  // Compute candidate emails for each user
  const usersWithCandidates = await Promise.all(
    users.map(async (u) => {
      const candidates = await adminUserService.getUserCandidateEmails(u.id);
      return { ...u, candidateEmails: candidates };
    })
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Premium Header */}
      <Box
        component="header"
        sx={{
          sticky: "top",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: 1,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2, display: "flex", items: "center", justify: "space-between", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          
          <Box component="nav" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LinkButton 
              href="/"
              variant="text"
              size="small"
              sx={{ fontWeight: "bold", textTransform: "none" }}
            >
              Back to Portal
            </LinkButton>
          </Box>
        </Container>
      </Box>

      {/* Main Grid */}
      <Container maxWidth="lg" sx={{ py: 6, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
              User Administration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Authorize user sign-ups, activate editor privileges, or assign system administrators.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, alignSelf: { xs: "flex-start", md: "center" } }}>
            <BroadcastEmailButton />
            <Chip
              label={`Authorized Session: ${session.user?.name || ""}`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Box>
        </Box>

        {/* Users Table / Grid */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: "auto", bgcolor: "background.paper" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", tracking: "0.05em", color: "text.secondary" }}>User</TableCell>
                <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", tracking: "0.05em", color: "text.secondary" }}>Status</TableCell>
                <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", tracking: "0.05em", color: "text.secondary" }}>Role</TableCell>
                <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", tracking: "0.05em", color: "text.secondary" }}>Member Profile</TableCell>
                <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", tracking: "0.05em", color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersWithCandidates.map((u) => {
                const isSyntheticEmail = u.email.endsWith("@orcid.org");

                return (
                  <TableRow key={u.id} sx={{ "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s" }}>
                    {/* User Info */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          src={u.image || undefined}
                          alt={u.name || "User Avatar"}
                          sx={{ width: 40, height: 40, border: "1px solid", borderColor: "divider", bgcolor: "primary.light", color: "primary.contrastText", fontWeight: "bold" }}
                        >
                          {!u.image && (u.name ? u.name.charAt(0).toUpperCase() : "U")}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
                            {u.name || "Unnamed User"}
                          </Typography>

                          <Chip
                            label={isSyntheticEmail ? `ORCID: ${u.email.replace("@orcid.org", "")}` : `Auth: ${u.email}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.625rem", height: 18, mt: 0.5, fontFamily: "monospace" }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {u.active ? (
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                        />
                      ) : (
                        <Chip
                          label="Pending Review"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: "bold", fontSize: "0.625rem", borderRadius: 1 }}
                        />
                      )}
                    </TableCell>

                    {/* Role Dropdown */}
                    <TableCell>
                      <RoleSelector userId={u.id} initialRole={u.role} />
                    </TableCell>

                    {/* Member Profile */}
                    <TableCell>
                      <MemberSelector userId={u.id} initialMemberId={u.memberId} members={members} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                        <EditUserButton
                          userId={u.id}
                          currentName={u.name || ""}
                          currentNotificationEmail={u.notificationEmail}
                          userAuthEmail={u.email}
                        />
                        <EmailUserButton
                          userId={u.id}
                          userName={u.name || "User"}
                          candidateEmails={u.candidateEmails}
                        />
                        <ActivationButton userId={u.id} initialActive={u.active} />
                        <DeleteUserButton userId={u.id} />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
