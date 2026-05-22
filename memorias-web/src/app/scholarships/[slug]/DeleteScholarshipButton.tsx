"use client";

import React, { useState } from "react";
import { deleteScholarship } from "../actions";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

export function DeleteScholarshipButton({
  scholarshipId,
  scholarshipTitle,
}: {
  scholarshipId: string;
  scholarshipTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteScholarship(scholarshipId);
      if (res.success) {
        setShowConfirm(false);
        router.push("/scholarships");
      } else {
        alert("An error occurred during deletion.");
      }
    } catch (err: any) {
      alert(err.message || "Unauthorized action.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        onClick={() => setShowConfirm(true)}
        sx={{
          borderRadius: 3,
          fontWeight: "bold",
          bgcolor: "rgba(211, 47, 47, 0.05)",
          borderColor: "rgba(211, 47, 47, 0.3)",
          "&:hover": {
            bgcolor: "rgba(211, 47, 47, 0.1)",
            borderColor: "error.main",
          },
        }}
      >
        Delete Scholarship
      </Button>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirm}
        onClose={() => !isDeleting && setShowConfirm(false)}
        aria-labelledby="confirm-delete-dialog-title"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle id="confirm-delete-dialog-title" sx={{ fontWeight: "bold", color: "error.main" }}>
          Delete Scholarship?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.primary" }}>
            Are you sure you want to delete <strong>{scholarshipTitle}</strong>? This action is permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
