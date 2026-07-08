import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";

interface TagInfo {
  tag: string;
  count: number;
}

interface TagActionDialogsProps {
  activeRenameTag: TagInfo | null;
  setActiveRenameTag: (tag: TagInfo | null) => void;
  renameValue: string;
  setRenameValue: (val: string) => void;
  handleRenameSubmit: (e: React.FormEvent) => void;

  activeMergeTag: TagInfo | null;
  setActiveMergeTag: (tag: TagInfo | null) => void;
  mergeTargetValue: string;
  setMergeTargetValue: (val: string) => void;
  handleMergeSubmit: (e: React.FormEvent) => void;

  activeDeleteTag: TagInfo | null;
  setActiveDeleteTag: (tag: TagInfo | null) => void;
  handleDelete: (tagToDelete: string) => void;

  activeAddTag: boolean;
  setActiveAddTag: (val: boolean) => void;
  addTagValue: string;
  setAddTagValue: (val: string) => void;
  handleAddSubmit: (e: React.FormEvent) => void;

  tags: TagInfo[];
  isPending: boolean;
}

export function TagActionDialogs({
  activeRenameTag,
  setActiveRenameTag,
  renameValue,
  setRenameValue,
  handleRenameSubmit,
  activeMergeTag,
  setActiveMergeTag,
  mergeTargetValue,
  setMergeTargetValue,
  handleMergeSubmit,
  activeDeleteTag,
  setActiveDeleteTag,
  handleDelete,
  activeAddTag,
  setActiveAddTag,
  addTagValue,
  setAddTagValue,
  handleAddSubmit,
  tags,
  isPending,
}: TagActionDialogsProps) {
  return (
    <>
      {/* 1. Rename Dialog */}
      <Dialog
        open={!!activeRenameTag}
        onClose={() => {
          setActiveRenameTag(null);
          setRenameValue("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Rename Classification Tag</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This renames <code>{activeRenameTag?.tag}</code> globally across all models.
          </DialogContentText>
          <TextField
            fullWidth
            required
            label="New Identifier"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="e.g. artificial intelligence"
            variant="outlined"
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 2, fontWeight: "bold" }}>
            Note: If the target name already exists, the tags will be merged and counts aggregated automatically.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setActiveRenameTag(null);
              setRenameValue("");
            }}
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isPending || !renameValue.trim() || renameValue.trim().toLowerCase() === activeRenameTag?.tag}
            onClick={handleRenameSubmit}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Renaming..." : "Save Rename"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Merge Dialog */}
      <Dialog
        open={!!activeMergeTag}
        onClose={() => {
          setActiveMergeTag(null);
          setMergeTargetValue("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Merge Taxonomy Tag</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This collapses all instances of <code>{activeMergeTag?.tag}</code> into another existing tag globally.
          </DialogContentText>
          <FormControl size="small" fullWidth required>
            <InputLabel id="merge-target-label">Target Tag Name</InputLabel>
            <Select
              labelId="merge-target-label"
              value={mergeTargetValue}
              onChange={(e) => setMergeTargetValue(e.target.value as string)}
              label="Target Tag Name"
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">
                <em>Select Merge Destination...</em>
              </MenuItem>
              {tags
                .filter((t) => t.tag !== activeMergeTag?.tag)
                .map((t) => (
                  <MenuItem key={t.tag} value={t.tag}>
                    {t.tag} ({t.count} items)
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            All records matching &ldquo;{activeMergeTag?.tag}&rdquo; will be updated to point to the selected tag instead. Duplicate allocations will be cleaned automatically.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setActiveMergeTag(null);
              setMergeTargetValue("");
            }}
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="info"
            disabled={isPending || !mergeTargetValue}
            onClick={handleMergeSubmit}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Merging..." : "Complete Merge"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Delete Confirmation Dialog */}
      <Dialog
        open={!!activeDeleteTag}
        onClose={() => setActiveDeleteTag(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Delete Tag Globally?</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DialogContentText variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{activeDeleteTag?.tag}</strong>?
          </DialogContentText>
          <Alert severity="error" icon={false} sx={{ borderRadius: 3 }}>
            This tag will be stripped from all <strong>{activeDeleteTag?.count}</strong> record(s) where it is currently used. <strong>This action is permanent and cannot be undone.</strong>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActiveDeleteTag(null)} disabled={isPending} sx={{ textTransform: "none", fontWeight: "bold" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isPending}
            onClick={() => activeDeleteTag && handleDelete(activeDeleteTag.tag)}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Add Dialog */}
      <Dialog
        open={activeAddTag}
        onClose={() => {
          setActiveAddTag(false);
          setAddTagValue("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: "black" }}>Add New Tag</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new empty tag in the system taxonomy.
          </DialogContentText>
          <TextField
            fullWidth
            required
            label="Tag Name"
            value={addTagValue}
            onChange={(e) => setAddTagValue(e.target.value)}
            placeholder="e.g. quantum computing"
            variant="outlined"
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setActiveAddTag(false);
              setAddTagValue("");
            }}
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isPending || !addTagValue.trim()}
            onClick={handleAddSubmit}
            sx={{ textTransform: "none", borderRadius: 3, fontWeight: "bold" }}
          >
            {isPending ? "Adding..." : "Add Tag"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
