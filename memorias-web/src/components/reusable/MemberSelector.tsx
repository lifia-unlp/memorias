"use client";

import React from "react";
import { EntitySelector } from "./EntitySelector";
import { Box, Checkbox, Avatar, Typography, ListItemText } from "@mui/material";

interface MemberOption {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  positionAtLab?: string | null;
  endDate?: string | Date | null;
}

interface MemberSelectorProps {
  items: MemberOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  layout?: "grid" | "list";
}

const isFormerMember = (member: MemberOption) => {
  if (!member.endDate) return false;
  const end = new Date(member.endDate);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return end < now;
};

const sortMembers = (items: MemberOption[]) => {
  return [...items].sort((a, b) => {
    const lastA = (a.lastName || "").toLowerCase();
    const lastB = (b.lastName || "").toLowerCase();
    if (lastA !== lastB) {
      return lastA.localeCompare(lastB);
    }
    const firstA = (a.firstName || "").toLowerCase();
    const firstB = (b.firstName || "").toLowerCase();
    return firstA.localeCompare(firstB);
  });
};

export function MemberSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: MemberSelectorProps) {
  return (
    <EntitySelector<MemberOption>
      title="Involved Lab Members"
      subtitle="Select researchers associated with this resource."
      searchPlaceholder={layout === "list" ? "Search researchers..." : "Search members..."}
      items={items}
      selectedIds={selectedIds}
      onChange={onChange}
      layout={layout}
      semanticsLabel="Involved lab members"
      getItemId={(m) => m.id}
      getSearchableFields={(m) => [m.firstName, m.lastName, m.positionAtLab]}
      sortItems={sortMembers}
      showFormerToggle={true}
      isFormer={isFormerMember}
      gridSizes={{ xs: 12, sm: 6, md: 4 }}
      renderListItem={(member, isChecked, former) => (
        <ListItemText
          primary={`${member.firstName} ${member.lastName}${former ? " (Former)" : ""}`}
          slotProps={{
            primary: {
              sx: {
                fontSize: "0.75rem",
                fontWeight: isChecked ? "bold" : "normal",
                color: former ? "text.secondary" : "text.primary",
              },
            },
          }}
        />
      )}
      renderItemDetails={(member, isChecked, former, handleToggle) => (
        <Box
          onClick={() => handleToggle(member.id)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: isChecked ? "primary.main" : "divider",
            bgcolor: isChecked ? "action.selected" : "background.paper",
            cursor: "pointer",
            opacity: former && !isChecked ? 0.7 : 1,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <Checkbox checked={isChecked} size="small" sx={{ p: 0.5 }} />
          {member.avatarUrl ? (
            <Avatar
              src={member.avatarUrl}
              alt={`${member.firstName} ${member.lastName}`}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", fontWeight: "bold" }}>
              {member.firstName[0]}
              {member.lastName[0]}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
              {member.firstName} {member.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem" }}>
              {member.positionAtLab || "Researcher"}{former ? " (Former)" : ""}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
}
