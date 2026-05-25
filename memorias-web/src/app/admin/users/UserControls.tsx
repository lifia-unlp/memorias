"use client";

import React, { useState } from "react";
import { toggleUserActivationAction, updateUserRoleAction, deleteUserAction, updateUserMemberAction, sendUserEmailAction } from "./actions";
import {
  Box,
  Select,
  MenuItem,
  Button,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

export function RoleSelector({
  userId,
  initialRole,
}: {
  userId: string;
  initialRole: "USER" | "EDITOR" | "ADMIN";
}) {
  const [role, setRole] = useState(initialRole);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", role);
      await updateUserRoleAction(formData);
    } catch (err) {
      console.error("Failed to update user role:", err);
      setRole(initialRole);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSave} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormControl size="small">
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          disabled={isSaving}
          sx={{ fontSize: "0.75rem", fontWeight: "bold", minWidth: 100, borderRadius: 2 }}
        >
          <MenuItem value="USER">USER</MenuItem>
          <MenuItem value="EDITOR">EDITOR</MenuItem>
          <MenuItem value="ADMIN">ADMIN</MenuItem>
        </Select>
      </FormControl>
      <Button
        type="submit"
        variant="outlined"
        size="small"
        disabled={isSaving || role === initialRole}
        sx={{
          fontSize: "0.625rem",
          fontWeight: "black",
          textTransform: "uppercase",
          py: 0.75,
          px: 1.5,
          borderRadius: 2,
        }}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </Box>
  );
}

export function ActivationButton({
  userId,
  initialActive,
}: {
  userId: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      await toggleUserActivationAction(formData);
      setActive(!active);
    } catch (err) {
      console.error("Failed to toggle user activation:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleToggle}>
      <Button
        type="submit"
        disabled={isUpdating}
        variant="outlined"
        size="small"
        color={active ? "error" : "success"}
        sx={{
          fontWeight: "bold",
          fontSize: "0.75rem",
          textTransform: "none",
          px: 2,
          py: 0.75,
          borderRadius: 2,
        }}
      >
        {isUpdating ? "Processing..." : active ? "Deactivate" : "Activate"}
      </Button>
    </Box>
  );
}

export function DeleteUserButton({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === currentUserId) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      await deleteUserAction(formData);
    } catch (err: unknown) {
      console.error("Failed to delete user:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user.";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (userId === currentUserId) {
    return null;
  }

  return (
    <Box component="form" onSubmit={handleDelete} sx={{ display: "inline-block", ml: 1 }}>
      <Button
        type="submit"
        disabled={isDeleting}
        variant="contained"
        size="small"
        color="error"
        sx={{
          fontWeight: "bold",
          fontSize: "0.75rem",
          textTransform: "none",
          px: 2,
          py: 0.75,
          borderRadius: 2,
        }}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </Box>
  );
}

export function MemberSelector({
  userId,
  initialMemberId,
  members,
}: {
  userId: string;
  initialMemberId: string | null;
  members: {
    id: string;
    firstName: string;
    lastName: string;
    user: { id: string; email: string } | null;
  }[];
}) {
  const [memberId, setMemberId] = useState(initialMemberId || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("memberId", memberId);
      await updateUserMemberAction(formData);
    } catch (err) {
      console.error("Failed to update user member mapping:", err);
      alert(err instanceof Error ? err.message : "Failed to update member mapping.");
      setMemberId(initialMemberId || "");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSave} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormControl size="small">
        <Select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          disabled={isSaving}
          sx={{ fontSize: "0.75rem", minWidth: 150, borderRadius: 2 }}
        >
          <MenuItem value=""><em>None / Unassigned</em></MenuItem>
          {members.map((m) => {
            const isAssignedToOther = m.user && m.user.id !== userId;
            const assignedEmail = isAssignedToOther && m.user ? m.user.email : "";
            return (
              <MenuItem
                key={m.id}
                value={m.id}
                disabled={!!isAssignedToOther}
                sx={{ fontSize: "0.85rem" }}
              >
                {m.lastName}, {m.firstName} {assignedEmail ? `(Assigned to ${assignedEmail})` : ""}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Button
        type="submit"
        variant="outlined"
        size="small"
        disabled={isSaving || memberId === (initialMemberId || "")}
        sx={{
          fontSize: "0.625rem",
          fontWeight: "black",
          textTransform: "uppercase",
          py: 0.75,
          px: 1.5,
          borderRadius: 2,
        }}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </Box>
  );
}

export function SendEmailDialog({
  open,
  onClose,
  recipientType,
  userId,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  recipientType: "individual" | "all_active";
  userId?: string;
  userEmail?: string;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("recipientType", recipientType);
      formData.append("subject", subject);
      formData.append("message", message);
      if (recipientType === "individual" && userId) {
        formData.append("userId", userId);
      }

      const res = await sendUserEmailAction(formData);
      if (res && res.success) {
        setSuccess(`Successfully sent ${res.count} email(s).`);
        setSubject("");
        setMessage("");
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Failed to send email:", err);
      setError(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={isSending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        {recipientType === "all_active" ? "Broadcast Email Announcement" : "Send Direct Email"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSend}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}
          
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
            Recipient:{" "}
            <Typography component="span" variant="body2" color="primary.main" sx={{ fontWeight: "bold" }}>
              {recipientType === "all_active"
                ? "All Active Portal Users"
                : userEmail || "Individual User"}
            </Typography>
          </Typography>

          <TextField
            fullWidth
            label="Subject"
            variant="outlined"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending || !!success}
            required
            size="small"
            slotProps={{ htmlInput: { sx: { fontSize: "0.85rem" } } }}
          />

          <TextField
            fullWidth
            label="Message Body"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending || !!success}
            required
            multiline
            rows={6}
            placeholder="Write your email body here..."
            size="small"
            slotProps={{ htmlInput: { sx: { fontSize: "0.85rem" } } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={onClose} disabled={isSending} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSending || !!success}
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function BroadcastEmailButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => setOpen(true)}
        sx={{
          fontWeight: "bold",
          textTransform: "none",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2.5,
          py: 0.75,
        }}
      >
        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Broadcast to Active Users
      </Button>
      <SendEmailDialog
        open={open}
        onClose={() => setOpen(false)}
        recipientType="all_active"
      />
    </>
  );
}

export function EmailUserButton({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          minWidth: 0,
          p: 0.75,
          borderRadius: 2,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title={`Email ${userEmail}`}
      >
        <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </Button>
      <SendEmailDialog
        open={open}
        onClose={() => setOpen(false)}
        recipientType="individual"
        userId={userId}
        userEmail={userEmail}
      />
    </>
  );
}
