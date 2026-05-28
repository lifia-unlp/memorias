"use client";

import React, { useState } from "react";
import { matchQueryTokens } from "@/lib/search";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Checkbox,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  FormControlLabel,
} from "@mui/material";

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

export function MemberSelector({
  items,
  selectedIds,
  onChange,
  layout = "grid",
}: MemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideFormer, setHideFormer] = useState(true);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const isFormer = (member: MemberOption) => {
    if (!member.endDate) return false;
    const end = new Date(member.endDate);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  // Sort by lastName, then by firstName
  const sortedItems = [...items].sort((a, b) => {
    const lastA = (a.lastName || "").toLowerCase();
    const lastB = (b.lastName || "").toLowerCase();
    if (lastA !== lastB) {
      return lastA.localeCompare(lastB);
    }
    const firstA = (a.firstName || "").toLowerCase();
    const firstB = (b.firstName || "").toLowerCase();
    return firstA.localeCompare(firstB);
  });

  const filteredItems = sortedItems.filter((item) => {
    if (hideFormer && isFormer(item) && !selectedIds.includes(item.id)) {
      return false;
    }
    return matchQueryTokens(searchQuery, [
      item.firstName,
      item.lastName,
      item.positionAtLab,
    ]);
  });

  if (layout === "list") {
    return (
      <Card data-component-semantics="Involved lab members" variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
            Involved Lab Members
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search researchers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={hideFormer}
                onChange={(e) => setHideFormer(e.target.checked)}
                size="small"
                sx={{ p: 0.5 }}
              />
            }
            label={<span style={{ fontSize: "0.75rem" }}>Hide former members</span>}
            sx={{ m: 0 }}
          />
          <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1, bgcolor: "background.paper" }}>
            <List dense disablePadding>
              {filteredItems.map((m) => {
                const isChecked = selectedIds.includes(m.id);
                const former = isFormer(m);
                return (
                  <ListItemButton
                    key={m.id}
                    dense
                    onClick={() => handleToggle(m.id)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <Checkbox
                      edge="start"
                      checked={isChecked}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                      sx={{ p: 0.5 }}
                    />
                    <ListItemText
                      primary={`${m.firstName} ${m.lastName}${former ? " (Former)" : ""}`}
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
                  </ListItemButton>
                );
              })}
              {filteredItems.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", py: 2 }}>
                  No members found
                </Typography>
              )}
            </List>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-component-semantics="Involved lab members" variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyItems: "center", justifyContent: "between", alignItems: { xs: "stretch", md: "center" }, borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 3, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              Involved Lab Members
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select researchers associated with this resource.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideFormer}
                  onChange={(e) => setHideFormer(e.target.checked)}
                  size="small"
                  sx={{ p: 0.5 }}
                />
              }
              label={<span style={{ fontSize: "0.75rem" }}>Hide former members</span>}
              sx={{ m: 0 }}
            />
            <TextField
              size="small"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: "100%", md: 260 } }}
            />
          </Box>
        </Box>

        {filteredItems.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 2 }}>
            No researchers found.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}>
            <Grid container spacing={2}>
              {filteredItems.map((member) => {
                const isChecked = selectedIds.includes(member.id);
                const former = isFormer(member);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
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
                      <Checkbox
                        checked={isChecked}
                        size="small"
                        sx={{ p: 0.5 }}
                      />
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
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
