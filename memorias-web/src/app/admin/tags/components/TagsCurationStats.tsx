import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { TagInfo } from "../useTagsCuration";

interface TagsCurationStatsProps {
  tags: TagInfo[];
}

export function TagsCurationStats({ tags }: TagsCurationStatsProps) {
  const uniqueCount = tags.length;
  const totalClassifications = tags.reduce((sum, t) => sum + t.count, 0);
  const popularCount = tags.filter((t) => t.count >= 5).length;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", tracking: "wider" }}>
              Unique Keywords
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "primary.main", mt: 1 }}>
              {uniqueCount}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", tracking: "wider" }}>
              Total Classifications
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
              {totalClassifications}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="caption" sx={{ fontWeight: "extrabold", color: "text.secondary", textTransform: "uppercase", tracking: "wider" }}>
              Highly Popular (5+ uses)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "success.main", mt: 1 }}>
              {popularCount}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
