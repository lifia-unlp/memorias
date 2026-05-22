import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { Logo } from "@/components/Logo";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
} from "@mui/material";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    action?: string;
    entityType?: string;
    limit?: string;
    page?: string;
  }>;
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN" || !session.user?.active) {
    redirect("/");
  }

  const { search, action, entityType, limit: limitParam, page: pageParam } = await searchParams;

  const limit = parseInt(limitParam || "20", 10) || 20;
  const page = parseInt(pageParam || "1", 10) || 1;
  const skip = (page - 1) * limit;
  const take = limit;

  // Build prisma query filters
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { userEmail: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { entitySlug: { contains: search, mode: "insensitive" } },
    ];
  }

  if (action) {
    whereClause.action = action;
  }

  if (entityType) {
    whereClause.entityType = entityType;
  }

  // Fetch audit logs sorted by newest with dynamic pagination skips
  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  // Fetch matched count for pagination calculations
  const matchedLogsCount = await prisma.auditLog.count({
    where: whereClause,
  });
  const totalPages = Math.ceil(matchedLogsCount / limit);

  // Calculate statistics for metrics cards
  const totalLogs = await prisma.auditLog.count();
  const createsCount = await prisma.auditLog.count({ where: { action: "CREATE" } });
  const updatesCount = await prisma.auditLog.count({ where: { action: "UPDATE" } });
  const deletesCount = await prisma.auditLog.count({ where: { action: "DELETE" } });

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
          
          <Box component="nav" sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <LinkButton 
              href="/admin/config"
              variant="text"
              color="inherit"
              sx={{ textTransform: "none", fontWeight: 500, fontSize: "0.875rem" }}
            >
              System Settings
            </LinkButton>
            <LinkButton 
              href="/admin/users"
              variant="text"
              color="inherit"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderLeft: "1px solid",
                borderColor: "divider",
                pl: 3,
                borderRadius: 0,
              }}
            >
              Users Panel
            </LinkButton>
            <LinkButton 
              href="/"
              variant="text"
              color="inherit"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderLeft: "1px solid",
                borderColor: "divider",
                pl: 3,
                borderRadius: 0,
              }}
            >
              Back to Portal
            </LinkButton>
          </Box>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: "1.75rem", fontWeight: 800, color: "text.primary", mb: 0.5 }}>
              System Auditing Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time administrative feed tracking creation, edits, and deletions across all scientific lab records.
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "primary.light",
              color: "primary.contrastText",
              px: 2,
              py: 1,
              borderRadius: 3,
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            Authorized Session: {session.user?.name}
          </Box>
        </Box>

        {/* Dynamic Metric Statistics Cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total Operations
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>
                    {totalLogs}
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: "bold" }}>
                    actions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "success.main", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Creations
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "success.main" }}>
                    {createsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                    items
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "info.main", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Edits / Updates
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "info.main" }}>
                    {updatesCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                    updates
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "error.main", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Deletions
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "error.main" }}>
                    {deletesCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                    purged
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Interactive Log Filters */}
        <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <Box component="form" method="GET">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
                  Search Details / Users
                </Typography>
                <TextField
                  fullWidth
                  name="search"
                  defaultValue={search || ""}
                  placeholder="Search by email, name, description..."
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
                  Operation Action
                </Typography>
                <FormControl fullWidth size="small">
                  <Select name="action" defaultValue={action || ""}>
                    <MenuItem value="">All Operations</MenuItem>
                    <MenuItem value="CREATE">CREATE</MenuItem>
                    <MenuItem value="UPDATE">UPDATE</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
                  Entity Model
                </Typography>
                <FormControl fullWidth size="small">
                  <Select name="entityType" defaultValue={entityType || ""}>
                    <MenuItem value="">All Entities</MenuItem>
                    <MenuItem value="Member">Members</MenuItem>
                    <MenuItem value="Project">Projects</MenuItem>
                    <MenuItem value="Thesis">Theses</MenuItem>
                    <MenuItem value="Scholarship">Scholarships</MenuItem>
                    <MenuItem value="Publication">Publications</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5, display: "block" }}>
                  Items Per Page
                </Typography>
                <FormControl fullWidth size="small">
                  <Select name="limit" defaultValue={limit.toString()}>
                    <MenuItem value="10">10 per page</MenuItem>
                    <MenuItem value="20">20 per page</MenuItem>
                    <MenuItem value="30">30 per page</MenuItem>
                    <MenuItem value="100">100 per page</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 1 }}>
                <LinkButton 
                  href="/admin/audit"
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Clear Filters
                </LinkButton>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Logs Feed Container */}
        <TableContainer component={Paper} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
          {logs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "semibold", color: "text.secondary", mb: 1 }}>
                No audit logs found matching selected parameters.
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Try modifying the search term or clear the filter forms.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "text.secondary" }}>Date & Time</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "text.secondary" }}>User Profile</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "text.secondary" }}>Action</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "text.secondary" }}>Model & Type</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", color: "text.secondary" }}>Change Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => {
                    let badgeColor: "default" | "success" | "info" | "error" = "default";
                    if (log.action === "CREATE") badgeColor = "success";
                    else if (log.action === "UPDATE") badgeColor = "info";
                    else if (log.action === "DELETE") badgeColor = "error";

                    return (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.8rem" }}>
                            {log.userEmail || "System/Anonymous"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}>
                            ID: {log.userId || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            color={badgeColor}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: "black", fontSize: "0.65rem", height: 20 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.entityType}
                            size="small"
                            sx={{ fontWeight: "bold", fontSize: "0.65rem", height: 20, bgcolor: "action.selected" }}
                          />
                          {log.entitySlug && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.65rem", display: "block", mt: 0.5, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>
                              slug: {log.entitySlug}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: "text.primary" }}>
                          {log.details || "No changes description provided."}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box sx={{ p: 2, bgcolor: "action.hover", borderTop: "1px solid", borderColor: "divider" }}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  currentSearchParams={{ search, action, entityType, limit }}
                  baseUrl="/admin/audit"
                />
              </Box>
            </Box>
          )}
        </TableContainer>
      </Container>
    </Box>
  );
}
