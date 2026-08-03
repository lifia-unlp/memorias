"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { updateFollowUpItemStatus, updateFollowUpHistory, deleteFollowUpHistory } from "../follow-up/actions";

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

  const handleEditChangeSave = async () => {
    if (!editingChange) return;
    const res = await updateFollowUpHistory(editingChange.id, editNotesText);
    if (res.success) {
      setEditingChange(null);
      window.location.reload();
    }
  };

  const handleAddNewsSave = async () => {
    if (!addingNewsItem) return;
    const res = await updateFollowUpItemStatus(addingNewsItem.id, newStatus as any, newNoteText);
    if (res.success) {
      setAddingNewsItem(null);
      setNewNoteText("");
      window.location.reload();
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

            return (
              <Box key={catKey}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, color: "text.primary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {CATEGORY_LABELS[catKey]}
                </Typography>
                
                <Grid container spacing={3}>
                  {catChanges.map((change) => {
                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={change.id}>
                        <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%", display: "flex", flexDirection: "column" }}>
                          <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <Box>
                              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", flexGrow: 1, pr: 2 }}>
                                  {change.followUpItem.title}
                                </Typography>
                                <Chip
                                  label={`${STATUS_LABELS[change.fromStatus as keyof typeof STATUS_LABELS] || change.fromStatus} -> ${STATUS_LABELS[change.toStatus as keyof typeof STATUS_LABELS] || change.toStatus}`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
                                />
                              </Stack>
                              <Box sx={{ mb: 2 }}>
                                {renderMarkdown(change.notes)}
                              </Box>
                            </Box>
                            
                            <Box>
                              <Divider sx={{ my: 1.5 }} />
                              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                  By {change.loggedBy?.name || change.loggedBy?.email || "System"} on {new Date(change.meetingDate).toLocaleDateString()}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setHistoryItem(change.followUpItem)}
                                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                                  >
                                    View History
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                      setAddingNewsItem(change.followUpItem);
                                      setNewStatus(change.followUpItem.status);
                                      setNewNoteText("");
                                    }}
                                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                                  >
                                    Add News
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                      setEditingChange(change);
                                      setEditNotesText(change.notes || "");
                                    }}
                                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                                  >
                                    Edit News
                                  </Button>
                                </Stack>
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
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
          <Button onClick={handleAddNewsSave} variant="contained" color="primary">
            Confirm News
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
          <Button onClick={handleEditChangeSave} variant="contained" color="primary">
            Save Notes
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
