"use client";

import React, { useState } from "react";
import { toggleUserActivationAction, updateUserRoleAction, deleteUserAction, updateUserMemberAction, sendUserEmailAction, updateUserProfileAction } from "./actions";
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
  InputLabel,
} from "@mui/material";

export function EditUserButton({
  userId,
  currentName,
  currentNotificationEmail,
  userAuthEmail,
}: {
  userId: string;
  currentName: string;
  currentNotificationEmail: string | null;
  userAuthEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [notificationEmail, setNotificationEmail] = useState(currentNotificationEmail || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", name);
      formData.append("notificationEmail", notificationEmail);

      await updateUserProfileAction(formData);
      setOpen(false);
    } catch (err: any) {
      console.error("Failed to update user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setOpen(true)}
        sx={{
          minWidth: 0,
          p: 0.75,
          borderRadius: 2,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Edit User Details"
      >
        <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </Button>

      <Dialog open={open} onClose={isSaving ? undefined : () => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Edit User Profile</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: "bold" }}>
                Auth Identifier (ORCID / DB Key):
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {userAuthEmail}
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              required
              size="small"
            />

            <TextField
              fullWidth
              label="Notification Email"
              variant="outlined"
              placeholder="e.g. user@institution.edu"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              disabled={isSaving}
              size="small"
              helperText="Destination email for notifications and announcements"
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setOpen(false)} disabled={isSaving} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              variant="contained"
              color="primary"
              size="small"
              sx={{ borderRadius: 2, minWidth: 90 }}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export function RoleSelector({
  userId,
  initialRole,
}: {
  userId: string;
  initialRole: "USER" | "EDITOR" | "POWER_EDITOR" | "ADMIN";
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
          <MenuItem value="POWER_EDITOR">POWER_EDITOR</MenuItem>
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
    <Button
      onClick={handleToggle}
      disabled={isUpdating}
      variant={active ? "outlined" : "contained"}
      color={active ? "warning" : "success"}
      size="small"
      sx={{
        fontSize: "0.625rem",
        fontWeight: "black",
        textTransform: "uppercase",
        py: 0.75,
        px: 1.5,
        borderRadius: 2,
      }}
    >
      {isUpdating ? "Updating..." : active ? "Deactivate" : "Activate"}
    </Button>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      await deleteUserAction(formData);
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      alert(err.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      variant="outlined"
      color="error"
      size="small"
      sx={{
        fontSize: "0.625rem",
        fontWeight: "black",
        textTransform: "uppercase",
        py: 0.75,
        px: 1.5,
        borderRadius: 2,
      }}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function MemberSelector({
  userId,
  initialMemberId,
  members,
}: {
  userId: string;
  initialMemberId: string | null;
  members: Array<{ id: string; firstName: string; lastName: string; user?: { id: string; email: string } | null }>;
}) {
  const [memberId, setMemberId] = useState<string>(initialMemberId || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("memberId", memberId || "");
      await updateUserMemberAction(formData);
    } catch (err: any) {
      console.error("Failed to update user member mapping:", err);
      alert(err.message || "Failed to assign member profile.");
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
          displayEmpty
          sx={{ fontSize: "0.75rem", fontWeight: "bold", minWidth: 160, borderRadius: 2 }}
        >
          <MenuItem value="">
            <em>Unlinked (No Member)</em>
          </MenuItem>
          {members.map((m) => {
            const isAssignedToOther = m.user && m.user.id !== userId;
            return (
              <MenuItem key={m.id} value={m.id} disabled={Boolean(isAssignedToOther)}>
                {m.lastName}, {m.firstName} {isAssignedToOther ? "(Assigned)" : ""}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Button
        type="submit"
        variant="outlined"
        size="small"
        disabled={isSaving || (memberId === (initialMemberId || ""))}
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
  userName,
  candidateEmails = [],
}: {
  open: boolean;
  onClose: () => void;
  recipientType: "individual" | "all_active";
  userId?: string;
  userName?: string;
  candidateEmails?: Array<{ label: string; email: string }>;
}) {
  const [selectedEmail, setSelectedEmail] = useState<string>(candidateEmails[0]?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (candidateEmails.length > 0) {
      setSelectedEmail(candidateEmails[0].email);
    } else {
      setSelectedEmail("");
    }
  }, [candidateEmails]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    if (recipientType === "individual" && !selectedEmail) {
      setError("Please select or specify a destination email address.");
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
        formData.append("selectedEmail", selectedEmail);
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
        {recipientType === "all_active" ? "Broadcast Email Announcement" : `Send Email to ${userName || "User"}`}
      </DialogTitle>
      <Box component="form" onSubmit={handleSend}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

          {recipientType === "individual" ? (
            <FormControl fullWidth size="small">
              <InputLabel id="destination-email-label">Destination Email Address</InputLabel>
              <Select
                labelId="destination-email-label"
                label="Destination Email Address"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                disabled={isSending || !!success || candidateEmails.length === 0}
              >
                {candidateEmails.map((c, idx) => (
                  <MenuItem key={idx} value={c.email}>
                    {c.email} ({c.label})
                  </MenuItem>
                ))}
              </Select>
              {candidateEmails.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  This user has no notification or member emails configured.
                </Typography>
              )}
            </FormControl>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
              Recipient:{" "}
              <Typography component="span" variant="body2" color="primary.main" sx={{ fontWeight: "bold" }}>
                All Active Portal Users with registered emails
              </Typography>
            </Typography>
          )}

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
            disabled={isSending || !!success || (recipientType === "individual" && !selectedEmail)}
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
  userName,
  candidateEmails,
}: {
  userId: string;
  userName: string;
  candidateEmails: Array<{ label: string; email: string }>;
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
        title={`Send email to ${userName}`}
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
        userName={userName}
        candidateEmails={candidateEmails}
      />
    </>
  );
}
