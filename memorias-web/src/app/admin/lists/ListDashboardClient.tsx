"use client";

import React, { useState } from "react";
import { createOption, checkOptionUsage, deleteOptionSafe } from "./actions";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  Alert,
} from "@mui/material";

interface SystemOption {
  id: string;
  listName: string;
  value: string;
}

const LISTS = [
  { id: "positionAtLab", title: "Lab Positions", desc: "Allowed role tags inside the laboratory." },
  { id: "positionAtUnlp", title: "UNLP Positions", desc: "Ranks at the Universidad Nacional de La Plata." },
  { id: "positionAtCIC", title: "CIC Positions", desc: "Rank categories within the CIC body." },
  { id: "positionAtCONICET", title: "CONICET Positions", desc: "Official researcher ranks in CONICET." },
  { id: "thesisLevel", title: "Thesis Levels", desc: "Academic degrees (e.g. PhD, Masters, Grade)." },
  { id: "scholarshipType", title: "Scholarship Types", desc: "Categories of fellowships and funding grants." },
];

export default function ListDashboardClient({
  initialOptions,
}: {
  initialOptions: SystemOption[];
}) {
  const [options, setOptions] = useState<SystemOption[]>(initialOptions);
  const [activeTab, setActiveTab] = useState("positionAtLab");
  const [searchQuery, setSearchQuery] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Reassignment Modal State
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingOption, setDeletingOption] = useState<SystemOption | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [replacementValue, setReplacementValue] = useState("clear_value");
  const [isDeleting, setIsDeleting] = useState(false);

  const activeMetadata = LISTS.find((l) => l.id === activeTab)!;

  // Filter options for the active tab and search query
  const activeOptions = options
    .filter((o) => o.listName === activeTab)
    .filter((o) => o.value.toLowerCase().includes(searchQuery.toLowerCase()));

  // Other options in the same list (available for replacement)
  const availableReplacements = options
    .filter((o) => o.listName === activeTab && o.id !== deletingOption?.id)
    .map((o) => o.value);

  // Add Option
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const val = newValue.trim();
    if (!val) return;

    setIsSubmitting(true);
    const res = await createOption(activeTab, val);
    setIsSubmitting(false);

    if (res.success && res.option) {
      setOptions((prev) => [...prev, res.option!].sort((a, b) => a.value.localeCompare(b.value)));
      setNewValue("");
    } else {
      setFormError(res.error || "Failed to create option");
    }
  };

  // Delete Clicked
  const handleDeleteClick = async (option: SystemOption) => {
    setDeletingOption(option);
    setIsCheckingUsage(true);
    setFormError("");

    // Check if the value is in use
    const res = await checkOptionUsage(option.listName, option.value);
    setIsCheckingUsage(false);

    if (res.success) {
      if (res.count > 0) {
        setUsageCount(res.count);
        setReplacementValue("clear_value");
        setShowModal(true);
      } else {
        // Direct safe delete since usage count is 0
        if (confirm(`Are you sure you want to delete "${option.value}"?`)) {
          setIsDeleting(true);
          const delRes = await deleteOptionSafe(option.id, null);
          setIsDeleting(false);
          if (delRes.success) {
            setOptions((prev) => prev.filter((o) => o.id !== option.id));
          } else {
            alert(delRes.error || "Failed to delete option");
          }
        }
      }
    } else {
      alert(res.error || "Failed to check option usage");
    }
  };

  // Confirm delete with reassignment modal
  const handleConfirmDelete = async () => {
    if (!deletingOption) return;

    setIsDeleting(true);
    const repVal = replacementValue === "clear_value" ? null : replacementValue;
    const res = await deleteOptionSafe(deletingOption.id, repVal);
    setIsDeleting(false);

    if (res.success) {
      setOptions((prev) => prev.filter((o) => o.id !== deletingOption.id));
      setShowModal(false);
      setDeletingOption(null);
    } else {
      alert(res.error || "Failed to safely delete option");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Category Switcher Tabs */}
      <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", mb: 2 }}>
          Select List Category
        </Typography>
        <Grid container spacing={1.5}>
          {LISTS.map((list) => {
            const isActive = activeTab === list.id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={list.id}>
                <Button
                  onClick={() => {
                    setActiveTab(list.id);
                    setSearchQuery("");
                    setFormError("");
                    setNewValue("");
                  }}
                  variant={isActive ? "contained" : "outlined"}
                  color={isActive ? "primary" : "inherit"}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 2,
                    borderRadius: 3,
                    textTransform: "none",
                    height: "100%",
                  }}
                >
                  <Box sx={{ width: "100%", overflow: "hidden" }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
                      {list.title}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", color: isActive ? "rgba(255,255,255,0.8)" : "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mt: 0.5, fontSize: "0.65rem" }}>
                      {list.desc}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* 2. List Control Area */}
      <Paper sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }} elevation={0}>
        {/* Top Active Bar */}
        <Box sx={{ bgcolor: "action.hover", p: 3, borderBottom: "1px solid", borderColor: "divider", display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: "1.15rem", fontWeight: 800, color: "primary.main", mb: 0.5 }}>
              {activeMetadata.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeMetadata.desc}
            </Typography>
          </Box>

          {/* Quick Search */}
          <TextField
            placeholder="Search options..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ width: { xs: "100%", md: 240 }, bgcolor: "background.paper" }}
          />
        </Box>

        {/* Option Creation Form */}
        <Box component="form" onSubmit={handleAdd} sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider", bgcolor: "action.selected", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <TextField
              fullWidth
              placeholder={`Add new option to ${activeMetadata.title}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={isSubmitting}
              size="small"
              sx={{ bgcolor: "background.paper" }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSubmitting || !newValue.trim()}
              sx={{ textTransform: "none", fontWeight: "bold", px: 4, py: 1, borderRadius: 3, shrink: 0 }}
            >
              {isSubmitting ? "Adding..." : "Add Option"}
            </Button>
          </Box>
          {formError && (
            <Alert severity="error" icon={false} sx={{ py: 0.5 }}>
              {formError}
            </Alert>
          )}
        </Box>

        {/* Options List */}
        <Box sx={{ p: 3 }}>
          {activeOptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4, fontWeight: "medium" }}>
              {searchQuery ? "No matching options found." : "No options defined yet in this category."}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {activeOptions.map((opt) => (
                <Grid size={{ xs: 12, sm: 6 }} key={opt.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                      "&:hover": {
                        bgcolor: "action.hover",
                        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {opt.value}
                    </Typography>
                    <Button
                      onClick={() => handleDeleteClick(opt)}
                      disabled={isCheckingUsage}
                      color="error"
                      size="small"
                      variant="text"
                      sx={{ textTransform: "none", fontWeight: "bold", fontSize: "0.75rem" }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* 3. Reassignment & Deletion Modal (Dialog) */}
      <Dialog
        open={showModal}
        onClose={() => {
          if (!isDeleting) {
            setShowModal(false);
            setDeletingOption(null);
          }
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          High Usage Warning
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <Typography variant="body2" sx={{ p: 2, bgcolor: "warning.light", color: "warning.contrastText", borderRadius: 3, fontSize: "0.775rem", lineHeight: 1.5 }}>
            The option <strong>"{deletingOption?.value}"</strong> is currently used by <strong>{usageCount}</strong> database records. Deleting it directly would orphan these fields. Please specify how to update these records:
          </Typography>

          <RadioGroup
            value={replacementValue}
            onChange={(e) => setReplacementValue(e.target.value)}
          >
            {availableReplacements.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                <FormControlLabel
                  value="replace"
                  control={<Radio size="small" checked={replacementValue !== "clear_value"} onChange={() => setReplacementValue(availableReplacements[0])} />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Reassign and replace usages with another option:
                    </Typography>
                  }
                />
                {replacementValue !== "clear_value" && (
                  <FormControl fullWidth size="small" sx={{ pl: 4, mt: 0.5 }}>
                    <Select
                      value={replacementValue}
                      onChange={(e) => setReplacementValue(e.target.value)}
                    >
                      {availableReplacements.map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}

            <FormControlLabel
              value="clear_value"
              control={<Radio size="small" />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Clear and set all usages to empty/null
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem", mt: 0.25 }}>
                    This leaves the field empty on the {usageCount} referencing records.
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ gap: 1.5, px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setShowModal(false);
              setDeletingOption(null);
            }}
            disabled={isDeleting}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            variant="contained"
            color="error"
            size="small"
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold", px: 3 }}
          >
            {isDeleting ? "Updating..." : "Apply & Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
