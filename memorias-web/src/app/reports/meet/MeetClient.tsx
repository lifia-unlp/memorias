"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
} from "@mui/material";
import { updateFollowUpItemStatus, updateFollowUpHistory, deleteFollowUpHistory, updateFollowUpItem } from "../follow-up/actions";

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

interface FollowUpItem {
  id: string;
  title: string;
  category: "PUBLICATION" | "PROJECT" | "THESIS" | "SCHOLARSHIP";
  status: string;
  description: string | null;
  owners: Member[];
  history: HistoryEntry[];
}

interface ChangeHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  notes: string | null;
  meetingDate: string;
  loggedBy: { name: string | null; email: string } | null;
  followUpItem: FollowUpItem;
}

const STATUS_LABELS = {
  PLANNING: "Planning",
  UNDER_EVALUATION: "Under Evaluation",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed/Finished/Published",
} as const;

interface MeetClientProps {
  initialItems: FollowUpItem[];
  recentChanges: ChangeHistory[];
}

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "info" | "warning" | "success" | "error" }> = {
  PLANNING: { label: "Planning / Idea", color: "default" },
  IN_PROGRESS: { label: "In Progress", color: "info" },
  UNDER_EVALUATION: { label: "Under Evaluation", color: "warning" },
  ACCEPTED: { label: "Accepted", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  COMPLETED: { label: "Completed / Finished / Published", color: "success" },
};

const CATEGORY_LABELS = {
  PUBLICATION: "Publications",
  PROJECT: "Projects",
  THESIS: "Theses",
  SCHOLARSHIP: "Scholarships",
} as const;

// Safe custom markdown parser for news/notes text
function renderMarkdown(text: string | null) {
  if (!text) return <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>No details logged.</Typography>;

  return (
    <Box sx={{ fontSize: "1rem", lineHeight: 1.6, color: "text.primary" }}>
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

export default function MeetClient({ recentChanges }: MeetClientProps) {
  const [groupBy, setGroupBy] = useState<"person" | "type">("person");

  const [noteMenu, setNoteMenu] = useState<{ anchor: HTMLElement; change: ChangeHistory } | null>(null);
  const [itemMenu, setItemMenu] = useState<{ anchor: HTMLElement; item: FollowUpItem } | null>(null);

  // Date range state (defaulting to last 7 days)
  const getSevenDaysAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  };
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(getSevenDaysAgoStr());
  const [dateTo, setDateTo] = useState(getTodayStr());

  // Edit follow-up item states
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Edit existing news log entry states
  const [editingChange, setEditingChange] = useState<ChangeHistory | null>(null);
  const [editNotesText, setEditNotesText] = useState("");

  // Log new update for a specific item (opened from a card)
  const [addingNewsItem, setAddingNewsItem] = useState<FollowUpItem | null>(null);
  const [newStatus, setNewStatus] = useState("PLANNING");
  const [newNoteText, setNewNoteText] = useState("");

  // History dialog states
  const [historyItem, setHistoryItem] = useState<FollowUpItem | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editHistoryNote, setEditHistoryNote] = useState("");

  // Filtering changes by date range
  const filteredChanges = recentChanges.filter((ch) => {
    const meetingDay = new Date(ch.meetingDate).toISOString().split("T")[0];
    return meetingDay >= dateFrom && meetingDay <= dateTo;
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveItemEdit = async () => {
    if (isSubmitting || !editingItem) return;
    setIsSubmitting(true);
    try {
      const res = await updateFollowUpItem(editingItem.id, {
        title: editTitle,
        description: editDescription,
        ownerIds: editingItem.owners ? editingItem.owners.map((o) => o.id) : [],
      });
      if (res.success) {
        setEditingItem(null);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChangeSave = async () => {
    if (isSubmitting || !editingChange) return;
    setIsSubmitting(true);
    try {
      const res = await updateFollowUpHistory(editingChange.id, editNotesText);
      if (res.success) {
        setEditingChange(null);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewsSave = async () => {
    if (isSubmitting || !addingNewsItem) return;
    setIsSubmitting(true);
    try {
      const res = await updateFollowUpItemStatus(addingNewsItem.id, newStatus as any, newNoteText);
      if (res.success) {
        setAddingNewsItem(null);
        setNewNoteText("");
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditHistorySave = async (historyId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await updateFollowUpHistory(historyId, editHistoryNote);
      if (res.success) {
        setEditingHistoryId(null);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (confirm("Are you sure you want to delete this progress note/news log entry?")) {
      const res = await deleteFollowUpHistory(historyId);
      if (res.success) {
        router.refresh();
      }
    }
  };

  const categoryKeys: (keyof typeof CATEGORY_LABELS)[] = ["PUBLICATION", "PROJECT", "THESIS", "SCHOLARSHIP"];

  return (
    <Box>
      <Paper elevation={0} sx={{ position: "sticky", top: 0, zIndex: 2, py: 2, mb: 3, borderBottom: "1px solid", borderColor: "divider", borderRadius: 0 }}>
        <Stack direction="row" useFlexGap spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <TextField size="small" label="Meeting Date From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" label="Meeting Date To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />
          <Stack spacing={0.5}>
            <Typography variant="caption" id="meeting-group-label">Group by</Typography>
            <ToggleButtonGroup exclusive size="small" value={groupBy} aria-labelledby="meeting-group-label" onChange={(_, value) => { if (value) setGroupBy(value); }}>
              <ToggleButton value="person">Person reporting</ToggleButton>
              <ToggleButton value="type">Type</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {filteredChanges.length} updates · {new Set(filteredChanges.map((ch) => ch.followUpItem.id)).size} items
      </Typography>

      {filteredChanges.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
          No changes or news logged during the selected period.
        </Typography>
      ) : (
        <Stack spacing={4}>
          {(() => {
            const groups = new Map<string, ChangeHistory[]>();
            filteredChanges.forEach((ch) => {
              const key = groupBy === "person"
                ? ch.loggedBy?.email || "unassigned"
                : ch.followUpItem.category;
              groups.set(key, [...(groups.get(key) || []), ch]);
            });
            const personLabel = (changes: ChangeHistory[]) => changes[0].loggedBy?.name || changes[0].loggedBy?.email || "No reporter assigned";
            const sortedGroups = Array.from(groups.entries()).sort(([a, ac], [b, bc]) => {
              if (groupBy === "type") return categoryKeys.indexOf(a as keyof typeof CATEGORY_LABELS) - categoryKeys.indexOf(b as keyof typeof CATEGORY_LABELS);
              if (a === "unassigned") return 1;
              if (b === "unassigned") return -1;
              return personLabel(ac).localeCompare(personLabel(bc));
            });
            return sortedGroups.map(([key, groupChanges]) => {
              const items = new Map<string, { item: FollowUpItem; changes: ChangeHistory[] }>();
              groupChanges.forEach((ch) => {
                const existing = items.get(ch.followUpItem.id);
                if (existing) existing.changes.push(ch);
                else items.set(ch.followUpItem.id, { item: ch.followUpItem, changes: [ch] });
              });
              const orderedItems = Array.from(items.values()).sort((a, b) => categoryKeys.indexOf(a.item.category) - categoryKeys.indexOf(b.item.category));
              return (
                <Box component="section" key={key} aria-label={groupBy === "person" ? personLabel(groupChanges) : CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}>
                  <Typography component="h2" variant="h5" sx={{ fontWeight: 750, pb: 1, borderBottom: "2px solid", borderColor: "divider" }}>
                    {groupBy === "person" ? personLabel(groupChanges) : CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}
                    <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: "0.9rem", fontWeight: 400 }}>· {items.size} {items.size === 1 ? "item" : "items"}</Typography>
                  </Typography>
                  {orderedItems.map(({ item, changes }, index) => (
                    <React.Fragment key={item.id}>
                      {groupBy === "person" && (index === 0 || orderedItems[index - 1].item.category !== item.category) && (
                        <Typography component="h3" variant="h6" sx={{ mt: 3, mb: 0.5, fontWeight: 650, color: "primary.main" }}>
                          {CATEGORY_LABELS[item.category]}
                        </Typography>
                      )}
                    <Box component="article" sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
                        <Typography component={groupBy === "person" ? "h4" : "h3"} variant="subtitle1" sx={{ fontWeight: 400, lineHeight: 1.5 }}>{item.title}</Typography>
                        <Chip size="small" label={STATUS_CONFIG[item.status]?.label || item.status} color={STATUS_CONFIG[item.status]?.color || "default"} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {item.owners.length > 0 && `Owners: ${item.owners.map((o) => `${o.firstName} ${o.lastName}`).join(", ")}`}
                      </Typography>
                      <Stack spacing={0.5}>
                        {[...changes].sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()).map((ch) => (
                          <Box key={ch.id} sx={{ display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr) auto", columnGap: { xs: 1, sm: 2 }, alignItems: "start" }}>
                            <Typography component="time" dateTime={ch.meetingDate} variant="body2" color="text.secondary" sx={{ pt: 0.25, whiteSpace: "nowrap" }}>
                              {new Date(ch.meetingDate).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ minWidth: 0, "& p": { mb: 0 }, "& li": { mb: 0 } }}>
                              {renderMarkdown(ch.notes?.trim() || null)}
                              {(groupBy === "type" || ch.fromStatus !== ch.toStatus) && (
                                <Typography variant="caption" color="text.secondary">
                                  {groupBy === "type" && `· ${ch.loggedBy?.name || ch.loggedBy?.email || "No reporter assigned"}`}
                                  {ch.fromStatus !== ch.toStatus && ` · ${STATUS_LABELS[ch.fromStatus as keyof typeof STATUS_LABELS] || ch.fromStatus} → ${STATUS_LABELS[ch.toStatus as keyof typeof STATUS_LABELS] || ch.toStatus}`}
                                </Typography>
                              )}
                            </Box>
                            <Button size="small" color="inherit" aria-label="Note actions" aria-haspopup="menu" onClick={(event) => setNoteMenu({ anchor: event.currentTarget, change: ch })} sx={{ color: "text.secondary", minWidth: 0, px: 0.5, py: 0, lineHeight: 1.5, fontWeight: 400, textTransform: "none" }}>Actions</Button>
                          </Box>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                        <Button size="small" onClick={() => { setAddingNewsItem(item); setNewStatus(item.status); setNewNoteText(""); }}>+ Add News</Button>
                        <Button size="small" color="inherit" aria-label="Item actions" aria-haspopup="menu" onClick={(event) => setItemMenu({ anchor: event.currentTarget, item })} sx={{ color: "text.secondary", fontWeight: 400, textTransform: "none" }}>More</Button>
                      </Stack>
                      {item.description && <Box component="details" sx={{ mt: 1 }}><Typography component="summary" variant="body2" sx={{ cursor: "pointer", color: "text.secondary" }}>Description</Typography><Box sx={{ mt: 1 }}>{renderMarkdown(item.description)}</Box></Box>}
                    </Box>
                    </React.Fragment>
                  ))}
                </Box>
              );
            });
          })()}
        </Stack>
      )}

      <Menu anchorEl={noteMenu?.anchor} open={Boolean(noteMenu)} onClose={() => setNoteMenu(null)}>
        <MenuItem onClick={() => { if (noteMenu) { setEditingChange(noteMenu.change); setEditNotesText(noteMenu.change.notes || ""); } setNoteMenu(null); }}>Edit note</MenuItem>
        <MenuItem sx={{ color: "error.main" }} onClick={() => { if (noteMenu) void handleDeleteHistory(noteMenu.change.id); setNoteMenu(null); }}>Delete note</MenuItem>
      </Menu>
      <Menu anchorEl={itemMenu?.anchor} open={Boolean(itemMenu)} onClose={() => setItemMenu(null)}>
        <MenuItem onClick={() => { if (itemMenu) setHistoryItem(itemMenu.item); setItemMenu(null); }}>History ({itemMenu?.item.history.length || 0})</MenuItem>
        <MenuItem onClick={() => { if (itemMenu) { setEditingItem(itemMenu.item); setEditTitle(itemMenu.item.title); setEditDescription(itemMenu.item.description || ""); } setItemMenu(null); }}>Edit details</MenuItem>
      </Menu>

      {/* Add new Update / News to a specific item Dialog */}
      <Dialog open={Boolean(addingNewsItem)} onClose={() => setAddingNewsItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Add Progress News / Update</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2, mt: 1.5 }}>
            Item: {addingNewsItem?.title}
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Meeting Status</InputLabel>
            <Select
              value={newStatus}
              label="Meeting Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="PLANNING">Planning / Idea</MenuItem>
              <MenuItem value="UNDER_EVALUATION">Under Evaluation</MenuItem>
              <MenuItem value="ACCEPTED">Accepted</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed/Finished/Published</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Progress notes, news or meeting comments"
            multiline
            rows={4}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAddingNewsItem(null)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNewsSave} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "Confirm News"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={Boolean(editingChange)} onClose={() => setEditingChange(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Progress News Note</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2, mt: 1.5 }}>
            Item: {editingChange?.followUpItem.title}
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Progress news / update notes"
            multiline
            rows={4}
            value={editNotesText}
            onChange={(e) => setEditNotesText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditingChange(null)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditChangeSave} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "Save Notes"}
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
                        label={`${STATUS_LABELS[h.fromStatus as keyof typeof STATUS_LABELS] || h.fromStatus} -> ${STATUS_LABELS[h.toStatus as keyof typeof STATUS_LABELS] || h.toStatus}`}
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

      {/* Edit Item Details Dialog */}
      <Dialog open={Boolean(editingItem)} onClose={() => setEditingItem(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Follow-Up Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1.5, mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Description (Markdown supported)"
            multiline
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditingItem(null)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveItemEdit} variant="contained" color="primary" disabled={isSubmitting || !editTitle.trim()}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
