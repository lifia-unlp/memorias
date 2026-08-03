"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

const CATEGORY_LABELS = {
  PUBLICATION: "Follow-up items for Publications",
  PROJECT: "Follow-up items for Projects",
  THESIS: "Follow-up items for Theses",
  SCHOLARSHIP: "Follow-up items for Scholarships",
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

export default function MeetClient({ recentChanges }: MeetClientProps) {
  const [isMinutesOpen, setIsMinutesOpen] = useState(false);

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
        window.location.reload();
      }
    }
  };

  const getMinutesText = () => {
    let txt = `FOLLOW-UP MEETING MINUTES - ${new Date().toLocaleDateString()}\n\n`;
    txt += `RECORDED CHANGES AND NEWS:\n`;
    filteredChanges.forEach((ch, idx) => {
      txt += `${idx + 1}. [${ch.followUpItem.category}] ${ch.followUpItem.title}\n`;
      txt += `   - Change: ${STATUS_LABELS[ch.fromStatus as keyof typeof STATUS_LABELS] || ch.fromStatus} to ${STATUS_LABELS[ch.toStatus as keyof typeof STATUS_LABELS] || ch.toStatus}\n`;
      txt += `   - News/Notes: "${ch.notes || "No additional notes."}"\n`;
      txt += `   - Logged By: ${ch.loggedBy?.name || ch.loggedBy?.email || "System"}\n\n`;
    });
    return txt;
  };

  const copyMinutesToClipboard = () => {
    navigator.clipboard.writeText(getMinutesText());
    alert("Minutes copied to clipboard!");
  };

  const categoryKeys: (keyof typeof CATEGORY_LABELS)[] = ["PUBLICATION", "PROJECT", "THESIS", "SCHOLARSHIP"];

  return (
    <Box>
      {/* Upper Toolbar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Meeting Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Meeting Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setIsMinutesOpen(true)}
                sx={{ borderRadius: 2, fontWeight: "bold" }}
              >
                Generate Minutes
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
        Meeting Notes & Changes for Selected Period
      </Typography>

      {filteredChanges.length === 0 ? (
        <Card sx={{ bgcolor: "action.hover", border: "1px dashed", borderColor: "divider", py: 8, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No changes or news logged during the selected period.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={4}>
          {categoryKeys.map((catKey) => {
            const catChanges = filteredChanges.filter((ch) => ch.followUpItem.category === catKey);
            if (catChanges.length === 0) return null;

            // Group news/changes by FollowUpItem ID for meeting efficiency
            const itemMap = new Map<string, { item: FollowUpItem; changes: ChangeHistory[] }>();
            catChanges.forEach((ch) => {
              const itemId = ch.followUpItem.id;
              if (!itemMap.has(itemId)) {
                itemMap.set(itemId, { item: ch.followUpItem, changes: [] });
              }
              itemMap.get(itemId)!.changes.push(ch);
            });
            const groupedItems = Array.from(itemMap.values());

            return (
              <Box key={catKey}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, color: "text.primary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {CATEGORY_LABELS[catKey]}
                </Typography>
                
                <Stack spacing={2.5}>
                  {groupedItems.map(({ item, changes }) => {
                    const currentStatusLabel = STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status;
                    return (
                      <Card key={item.id} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", p: 2.5 }}>
                        {/* Item Header */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                              {item.title}
                            </Typography>
                            {item.owners && item.owners.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Owners: {item.owners.map((o) => `${o.firstName} ${o.lastName}`).join(", ")}
                              </Typography>
                            )}
                            {item.description && (
                              <Box sx={{ mt: 0.5, color: "text.secondary" }}>
                                {renderMarkdown(item.description)}
                              </Box>
                            )}
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Chip
                              label={currentStatusLabel}
                              size="small"
                              color="primary"
                              sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setAddingNewsItem(item);
                                setNewStatus(item.status);
                                setNewNoteText("");
                              }}
                              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: "bold" }}
                            >
                              Add News
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setEditingItem(item);
                                setEditTitle(item.title);
                                setEditDescription(item.description || "");
                              }}
                              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: "bold" }}
                            >
                              Edit Item
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setHistoryItem(item)}
                              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: "bold" }}
                            >
                              View History
                            </Button>
                          </Stack>
                        </Box>

                        {/* News / Notes for selected period */}
                        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            News & Updates for Period ({changes.length})
                          </Typography>
                          {changes.map((ch) => {
                            const transitionStr = `${STATUS_LABELS[ch.fromStatus as keyof typeof STATUS_LABELS] || ch.fromStatus} → ${STATUS_LABELS[ch.toStatus as keyof typeof STATUS_LABELS] || ch.toStatus}`;
                            return (
                              <Box key={ch.id} sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    <Chip
                                      label={transitionStr}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                      sx={{ fontSize: "0.6875rem", fontWeight: "bold", height: 20 }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                      By {ch.loggedBy?.name || ch.loggedBy?.email || "System"} on {new Date(ch.meetingDate).toLocaleDateString()}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" spacing={0.5}>
                                    <Button
                                      size="small"
                                      variant="text"
                                      onClick={() => {
                                        setEditingChange(ch);
                                        setEditNotesText(ch.notes || "");
                                      }}
                                      sx={{ textTransform: "none", fontSize: "0.7rem", py: 0 }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="text"
                                      color="error"
                                      onClick={() => handleDeleteHistory(ch.id)}
                                      sx={{ textTransform: "none", fontSize: "0.7rem", py: 0 }}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                </Box>
                                <Box sx={{ pt: 0.5 }}>
                                  {renderMarkdown(ch.notes)}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

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

      {/* Minutes Dialog */}
      <Dialog open={isMinutesOpen} onClose={() => setIsMinutesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Meeting Minutes Preview</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={getMinutesText()}
            slotProps={{ input: { readOnly: true } }}
            sx={{ fontFamily: "monospace", fontSize: "0.85rem", bgcolor: "action.hover", mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsMinutesOpen(false)} color="secondary">
            Close
          </Button>
          <Button onClick={copyMinutesToClipboard} variant="contained" color="secondary">
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
