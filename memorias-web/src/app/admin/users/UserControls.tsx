"use client";

import React, { useState } from "react";
import { toggleUserActivationAction, updateUserRoleAction, deleteUserAction, updateUserMemberAction } from "./actions";
import {
  Box,
  Select,
  MenuItem,
  Button,
  FormControl,
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
