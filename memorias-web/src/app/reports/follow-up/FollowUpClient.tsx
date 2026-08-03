"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Collapse,
  Checkbox,
  ListItemText,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Grid,
} from "@mui/material";
import {
  createFollowUpItem,
  updateFollowUpItemStatus,
  archiveFollowUpItem,
  updateFollowUpItem,
  updateFollowUpHistory,
  deleteFollowUpHistory,
} from "./actions";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface HistoryEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  notes: string | null;
  meetingDate: string;
  loggedBy?: { name: string | null; email: string } | null;
}

interface RealizationOption {
  id: string;
  title: string;
  slug: string;
}

interface FollowUpItem {
  id: string;
  title: string;
  description: string | null;
  category: "PUBLICATION" | "PROJECT" | "THESIS" | "SCHOLARSHIP";
  status: "PLANNING" | "UNDER_EVALUATION" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED";
  archived: boolean;
  owners: Member[];
  history: HistoryEntry[];
  publicationId?: string | null;
  projectId?: string | null;
  thesisId?: string | null;
  scholarshipId?: string | null;
  publication?: RealizationOption | null;
  project?: RealizationOption | null;
  thesis?: RealizationOption | null;
  scholarship?: RealizationOption | null;
}

interface FollowUpClientProps {
  initialItems: FollowUpItem[];
  members: Member[];
  currentMember: Member | null;
  publications: RealizationOption[];
  projects: RealizationOption[];
  theses: RealizationOption[];
  scholarships: RealizationOption[];
}

const CATEGORY_LABELS = {
  PUBLICATION: "Publications",
  PROJECT: "Projects",
  THESIS: "Theses",
  SCHOLARSHIP: "Scholarships",
} as const;

const STATUS_COLORS = {
  PLANNING: "default",
  UNDER_EVALUATION: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
  IN_PROGRESS: "info",
  COMPLETED: "success",
} as const;

// Safe custom markdown parser for news/notes text
function renderMarkdown(text: string | null) {
  if (!text) return <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>No details logged.</Typography>;

  return (
    <Box sx={{ fontSize: "0.85rem", lineHeight: 1.5, color: "text.primary" }}>
      {text.split("\n").map((line, i) => {
        let rendered = line;
        // Bold: **text**
        rendered = rendered.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Italic: *text*
        rendered = rendered.replace(/\*(.*?)\*/g, "<em>$1</em>");

        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const content = rendered.replace(/^[\s-*]+/, "");
          return (
            <Box component="li" key={i} sx={{ ml: 2, mb: 0.5 }} dangerouslySetInnerHTML={{ __html: content }} />
          );
        }
        return (
          <Typography
            key={i}
            variant="body2"
            sx={{ mb: 0.5, minHeight: line.trim() === "" ? "1em" : "auto" }}
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        );
      })}
    </Box>
  );
}

function truncateText(str: string | null, max: number = 140) {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.substring(0, max) + "...";
}

export default function FollowUpClient({
  initialItems,
  members,
  currentMember,
  publications,
  projects,
  theses,
  scholarships,
}: FollowUpClientProps) {
  const [items, setItems] = useState<FollowUpItem[]>(initialItems);
  
  // Sorting members
  const sortedMembers = [...members].sort((a, b) => {
    const nameA = `${a.lastName}, ${a.firstName}`.toLowerCase();
    const nameB = `${b.lastName}, ${b.firstName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Consolidated filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [onlyMyItems, setOnlyMyItems] = useState(currentMember !== null);

  // Create dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<FollowUpItem["category"]>("PUBLICATION");
  const [newOwners, setNewOwners] = useState<string[]>(
    currentMember ? [currentMember.id] : []
  );

  // Edit dialog states
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editOwners, setEditOwners] = useState<string[]>([]);
  const [editRealizationId, setEditRealizationId] = useState<string>("");

  // Update status inline states
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<FollowUpItem["status"]>("PLANNING");
  const [updateNote, setUpdateNote] = useState("");

  // History dialog states
  const [historyItem, setHistoryItem] = useState<FollowUpItem | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editHistoryNote, setEditHistoryNote] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const res = await createFollowUpItem({
      title: newTitle,
      description: newDesc || undefined,
      category: newCategory,
      ownerIds: newOwners,
    });
    if (res.success) {
      window.location.reload();
    }
  };

  const handleEditSave = async () => {
    if (!editingItem || !editTitle.trim()) return;

    const payload: any = {
      title: editTitle,
      description: editDesc || undefined,
      ownerIds: editOwners,
      publicationId: null,
      projectId: null,
      thesisId: null,
      scholarshipId: null,
    };

    if (editingItem.category === "PUBLICATION") payload.publicationId = editRealizationId || null;
    else if (editingItem.category === "PROJECT") payload.projectId = editRealizationId || null;
    else if (editingItem.category === "THESIS") payload.thesisId = editRealizationId || null;
    else if (editingItem.category === "SCHOLARSHIP") payload.scholarshipId = editRealizationId || null;

    const res = await updateFollowUpItem(editingItem.id, payload);
    if (res.success) {
      setEditingItem(null);
      window.location.reload();
    }
  };

  const handleUpdateStatus = async (itemId: string) => {
    const res = await updateFollowUpItemStatus(itemId, updateStatus, updateNote);
    if (res.success) {
      setUpdateNote("");
      setExpandedId(null);
      window.location.reload();
    }
  };

  const handleToggleArchive = async (item: FollowUpItem) => {
    const res = await archiveFollowUpItem(item.id, !item.archived);
    if (res.success) {
      setItems(items.map((i) => (i.id === item.id ? { ...i, archived: !item.archived } : i)));
    }
  };

  const handleEditHistorySave = async (historyId: string) => {
    const res = await updateFollowUpHistory(historyId, editHistoryNote);
    if (res.success) {
      setEditingHistoryId(null);
      window.location.reload();
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (confirm("Are you sure you want to delete this progress note/news log entry?")) {
      const res = await deleteFollowUpHistory(historyId);
      if (res.success) {
        window.location.reload();
      }
    }
  };

  // Filter items in memory
  const filteredItems = items.filter((item) => {
    if (onlyMyItems && currentMember) {
      const hasOwnership = item.owners && item.owners.some((owner) => owner.id === currentMember.id);
      if (!hasOwnership) {
        return false;
      }
    }
    if (
      search.trim() &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !(item.description || "").toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter !== "ALL" && item.status !== statusFilter) {
      return false;
    }
    if (!showArchived && item.archived) {
      return false;
    }
    return true;
  });

  const categoriesKeys: (keyof typeof CATEGORY_LABELS)[] = ["PUBLICATION", "PROJECT", "THESIS", "SCHOLARSHIP"];

  // Dropdown helper variables for editing realizations
  let realizationOptions: RealizationOption[] = [];
  let realizationLabel = "";
  if (editingItem) {
    if (editingItem.category === "PUBLICATION") {
      realizationOptions = publications;
      realizationLabel = "Related Publication";
    } else if (editingItem.category === "PROJECT") {
      realizationOptions = projects;
      realizationLabel = "Related Project";
    } else if (editingItem.category === "THESIS") {
      realizationOptions = theses;
      realizationLabel = "Related Thesis";
    } else if (editingItem.category === "SCHOLARSHIP") {
      realizationOptions = scholarships;
      realizationLabel = "Related Scholarship";
    }
  }

  return (
    <Box>
      {!currentMember && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          [NOTE] Your user account is not linked to a physical Member record. 
          The "Only My Items" filter option is disabled. Contact an administrator to link your profile.
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Search items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="PLANNING">Planning</MenuItem>
                <MenuItem value="UNDER_EVALUATION">Under Evaluation</MenuItem>
                <MenuItem value="ACCEPTED">Accepted</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 5 }}>
            <Stack direction="row" spacing={3} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={currentMember === null}
                    checked={onlyMyItems}
                    onChange={(e) => setOnlyMyItems(e.target.checked)}
                    color="primary"
                  />
                }
                label="Only My Items"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Archived"
              />
              <Button
                variant="contained"
                onClick={() => setIsCreateOpen(true)}
                sx={{ borderRadius: 2, fontWeight: "bold" }}
              >
                Create Item
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {filteredItems.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8, borderRadius: 3, border: "1px dashed", borderColor: "divider" }}>
          <Typography variant="h6" color="text.secondary">
            No follow-up items match the active filters.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Adjust your search or click "Create Item" to add a new follow-up item.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={4}>
          {categoriesKeys.map((catKey) => {
            const catItems = filteredItems.filter((item) => item.category === catKey);
            if (catItems.length === 0) return null;

            return (
              <Box key={catKey}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5, color: "text.primary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {CATEGORY_LABELS[catKey]}
                </Typography>
                
                <TableContainer component={Paper} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", width: "35%" }}>Title & Description</TableCell>
                        <TableCell sx={{ fontWeight: "bold", width: "45%" }}>Latest News / Notes</TableCell>
                        <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: "bold", width: "10%" }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {catItems.map((item) => {
                        const isExpanded = expandedId === item.id;
                        const latestUpdate = item.history.length > 0 ? item.history[0] : null;

                        // Construct realization url link if linked
                        let realizationUrl = "";
                        if (item.category === "PUBLICATION" && item.publication) {
                          realizationUrl = `/publications/${item.publication.slug}`;
                        } else if (item.category === "PROJECT" && item.project) {
                          realizationUrl = `/projects/${item.project.slug}`;
                        } else if (item.category === "THESIS" && item.thesis) {
                          realizationUrl = `/theses/${item.thesis.slug}`;
                        } else if (item.category === "SCHOLARSHIP" && item.scholarship) {
                          realizationUrl = `/scholarships/${item.scholarship.slug}`;
                        }

                        return (
                          <React.Fragment key={item.id}>
                            <TableRow hover sx={{ opacity: item.archived ? 0.6 : 1 }}>
                              <TableCell>
                                {realizationUrl ? (
                                  <Link
                                    href={realizationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      textDecoration: "underline",
                                      color: "var(--mui-palette-primary-main)",
                                      fontWeight: "bold",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {item.title}
                                  </Link>
                                ) : (
                                  <Typography variant="body2" sx={{ fontWeight: "bold", textDecoration: item.archived ? "line-through" : "none" }}>
                                    {item.title}
                                  </Typography>
                                )}
                                {item.description && (
                                  <Box sx={{ mt: 0.5, color: "text.secondary" }}>
                                    {renderMarkdown(truncateText(item.description, 140))}
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell>
                                {latestUpdate ? (
                                  <Box>
                                    {renderMarkdown(latestUpdate.notes)}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                      Logged by {latestUpdate.loggedBy?.name || latestUpdate.loggedBy?.email || "System"} on {new Date(latestUpdate.meetingDate).toLocaleString()}
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="text"
                                      onClick={() => setHistoryItem(item)}
                                      sx={{ fontSize: "0.65rem", p: 0, minWidth: 0, textTransform: "none", mt: 0.5 }}
                                    >
                                      View history ({item.history.length})
                                    </Button>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                    No updates logged
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status.replace("_", " ")}
                                  size="small"
                                  color={STATUS_COLORS[item.status]}
                                  sx={{ fontWeight: "bold", fontSize: "0.65rem", height: 20 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                      if (isExpanded) {
                                        setExpandedId(null);
                                      } else {
                                        setExpandedId(item.id);
                                        setUpdateStatus(item.status);
                                        setUpdateNote("");
                                      }
                                    }}
                                  >
                                    Update
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                      setEditingItem(item);
                                      setEditTitle(item.title);
                                      setEditDesc(item.description || "");
                                      setEditOwners(item.owners.map((m) => m.id));
                                      
                                      // Pre-populate dropdown select values
                                      if (item.category === "PUBLICATION") setEditRealizationId(item.publicationId || "");
                                      else if (item.category === "PROJECT") setEditRealizationId(item.projectId || "");
                                      else if (item.category === "THESIS") setEditRealizationId(item.thesisId || "");
                                      else if (item.category === "SCHOLARSHIP") setEditRealizationId(item.scholarshipId || "");
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    color={item.archived ? "success" : "error"}
                                    onClick={() => handleToggleArchive(item)}
                                  >
                                    {item.archived ? "Restore" : "Archive"}
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>

                            {/* Inline status transition expanded row */}
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ py: 2, display: "flex", gap: 2, alignItems: "center" }}>
                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                      <InputLabel>New Status</InputLabel>
                                      <Select
                                        value={updateStatus}
                                        label="New Status"
                                        onChange={(e) => setUpdateStatus(e.target.value as FollowUpItem["status"])}
                                      >
                                        <MenuItem value="PLANNING">Planning / Idea</MenuItem>
                                        <MenuItem value="UNDER_EVALUATION">Under Evaluation</MenuItem>
                                        <MenuItem value="ACCEPTED">Accepted</MenuItem>
                                        <MenuItem value="REJECTED">Rejected</MenuItem>
                                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                        <MenuItem value="COMPLETED">Completed</MenuItem>
                                      </Select>
                                    </FormControl>
                                    <TextField
                                      size="small"
                                      label="Add progress notes or news"
                                      multiline
                                      value={updateNote}
                                      onChange={(e) => setUpdateNote(e.target.value)}
                                      sx={{ flexGrow: 1 }}
                                    />
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleUpdateStatus(item.id)}
                                    >
                                      Save Update
                                    </Button>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Create Follow-Up Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title / Idea"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Short description or goal"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newCategory}
              label="Category"
              onChange={(e) => setNewCategory(e.target.value as FollowUpItem["category"])}
            >
              <MenuItem value="PUBLICATION">Publication (Paper/Conference)</MenuItem>
              <MenuItem value="PROJECT">Project (Subsidies/Grants)</MenuItem>
              <MenuItem value="THESIS">Thesis</MenuItem>
              <MenuItem value="SCHOLARSHIP">Scholarship (Fellowships)</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Owners</InputLabel>
            <Select
              multiple
              value={newOwners}
              label="Owners"
              onChange={(e) => setNewOwners(e.target.value as string[])}
              renderValue={(selected) =>
                (selected as string[])
                  .map((id) => {
                    const m = sortedMembers.find((member) => member.id === id);
                    return m ? `${m.lastName}, ${m.firstName}` : id;
                  })
                  .sort((a, b) => a.localeCompare(b))
                  .join("; ")
              }
            >
              {sortedMembers.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  <Checkbox checked={newOwners.indexOf(m.id) > -1} />
                  <ListItemText primary={`${m.lastName}, ${m.firstName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsCreateOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained">
            Create Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingItem)} onClose={() => setEditingItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Follow-Up Item Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title / Idea"
            type="text"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Short description or goal"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Owners</InputLabel>
            <Select
              multiple
              value={editOwners}
              label="Owners"
              onChange={(e) => setEditOwners(e.target.value as string[])}
              renderValue={(selected) =>
                (selected as string[])
                  .map((id) => {
                    const m = sortedMembers.find((member) => member.id === id);
                    return m ? `${m.lastName}, ${m.firstName}` : id;
                  })
                  .sort((a, b) => a.localeCompare(b))
                  .join("; ")
              }
            >
              {sortedMembers.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  <Checkbox checked={editOwners.indexOf(m.id) > -1} />
                  <ListItemText primary={`${m.lastName}, ${m.firstName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Realization Dropdown */}
          {editingItem && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{realizationLabel}</InputLabel>
              <Select
                value={editRealizationId}
                label={realizationLabel}
                onChange={(e) => setEditRealizationId(e.target.value)}
              >
                <MenuItem value="">
                  <em>None - No related object</em>
                </MenuItem>
                {realizationOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditingItem(null)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Log Dialog */}
      <Dialog open={Boolean(historyItem)} onClose={() => { setHistoryItem(null); setEditingHistoryId(null); }} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>History & News Log: {historyItem?.title}</DialogTitle>
        <DialogContent>
          {historyItem?.history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No updates or news logged for this item yet.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {historyItem?.history.map((h) => {
                const isEditing = editingHistoryId === h.id;
                return (
                  <Box key={h.id} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Chip
                        label={`${h.fromStatus} -> ${h.toStatus}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", fontWeight: "bold" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        By {h.loggedBy?.name || h.loggedBy?.email || "System"} on {new Date(h.meetingDate).toLocaleString()}
                      </Typography>
                    </Stack>

                    {isEditing ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={4}
                          value={editHistoryNote}
                          onChange={(e) => setEditHistoryNote(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Button size="small" variant="text" onClick={() => setEditingHistoryId(null)}>Cancel</Button>
                          <Button size="small" variant="contained" onClick={() => handleEditHistorySave(h.id)}>Save</Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Box>
                        <Box sx={{ mb: 1.5 }}>
                          {renderMarkdown(h.notes)}
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setEditingHistoryId(h.id);
                              setEditHistoryNote(h.notes || "");
                            }}
                          >
                            Edit Note
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteHistory(h.id)}
                          >
                            Delete Log
                          </Button>
                        </Stack>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setHistoryItem(null); setEditingHistoryId(null); }} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
