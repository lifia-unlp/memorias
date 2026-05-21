"use client";

import React, { useState } from "react";
import { toggleUserActivationAction, updateUserRoleAction, deleteUserAction } from "./actions";

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
      // Fallback
      setRole(initialRole);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        disabled={isSaving}
        className="bg-background text-foreground text-xs font-bold border border-border px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
      >
        <option value="USER">USER</option>
        <option value="EDITOR">EDITOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button
        type="submit"
        disabled={isSaving || role === initialRole}
        className="text-[10px] uppercase font-extrabold px-2.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </form>
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
    <form onSubmit={handleToggle}>
      <button
        type="submit"
        disabled={isUpdating}
        className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-sm disabled:opacity-50 ${
          active
            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
        }`}
      >
        {isUpdating ? "Processing..." : active ? "Deactivate" : "Activate"}
      </button>
    </form>
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
    <form onSubmit={handleDelete} className="inline-block ml-2">
      <button
        type="submit"
        disabled={isDeleting}
        className="text-xs font-bold px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-all shadow-sm disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </form>
  );
}
