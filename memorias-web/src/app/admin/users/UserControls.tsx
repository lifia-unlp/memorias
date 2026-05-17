"use client";

import React, { useState } from "react";
import { toggleUserActivationAction, updateUserRoleAction } from "./actions";

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
