"use client";

import React from "react";
import Link from "next/link";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
} from "@mui/material";

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  positionAtLab: string | null;
  avatarUrl: string | null;
}

interface RelatedMembersProps {
  members: MemberData[];
  title?: string;
}

export function RelatedMembers({ members, title = "Relevant lab members" }: RelatedMembersProps) {
  if (!members || members.length === 0) return null;

  return (
    <Box data-component-semantics="Relevant lab members" sx={{ width: "100%" }}>
      <Typography
        variant="h3"
        sx={{
          mb: 2.5,
          fontSize: "1.15rem",
          fontWeight: 700,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {members.map((member) => {
          const fullName = `${member.firstName} ${member.lastName}`;
          const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  p: 1.5,
                }}
                component={Link}
                href={`/members/${member.slug}`}
              >
                <Avatar
                  src={member.avatarUrl || undefined}
                  sx={{
                    width: 44,
                    height: 44,
                    mr: 2,
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    bgcolor: "primary.light",
                    color: "primary.main",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {initials || "M"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: "text.primary",
                      lineHeight: 1.2,
                    }}
                  >
                    {fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.725rem",
                      fontWeight: 500,
                      mt: 0.5,
                    }}
                  >
                    {member.positionAtLab || "Researcher"}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
