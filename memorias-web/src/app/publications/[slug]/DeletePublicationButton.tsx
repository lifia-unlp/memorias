"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePublication } from "../actions";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";

export function DeletePublicationButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const res = await deletePublication(id);
      if (res.success) {
        setIsOpen(false);
        router.push("/publications");
      } else {
        setError(res.error || "Failed to delete publication");
      }
    });
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        onClick={() => setIsOpen(true)}
        sx={{
          borderRadius: 3,
          fontWeight: "bold",
          "&:hover": {
            bgcolor: "error.dark",
          },
        }}
      >
        Delete Publication
      </Button>

      {/* Confirmation Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => !isPending && setIsOpen(false)}
        aria-labelledby="confirm-delete-dialog-title"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle id="confirm-delete-dialog-title" sx={{ fontWeight: "bold", color: "error.main" }}>
          Delete Publication?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.primary", mb: 2 }}>
            Are you sure you want to permanently delete the publication <strong>{title}</strong>? This action is permanent and cannot be undone.
          </DialogContentText>

          {error && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(211, 47, 47, 0.05)",
                border: "1px solid",
                borderColor: "error.light",
                color: "error.main",
                borderRadius: 2,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsOpen(false)}
            disabled={isPending}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
