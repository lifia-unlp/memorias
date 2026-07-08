import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { TagInfo } from "../useTagsCuration";

interface TagsCurationTableProps {
  filteredTags: TagInfo[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveAddTag: (active: boolean) => void;
  setAddTagValue: (value: string) => void;
  setActiveRenameTag: (tag: TagInfo) => void;
  setRenameValue: (value: string) => void;
  setActiveMergeTag: (tag: TagInfo) => void;
  setMergeTargetValue: (value: string) => void;
  setActiveDeleteTag: (tag: TagInfo) => void;
  isPending: boolean;
}

export function TagsCurationTable({
  filteredTags,
  searchQuery,
  setSearchQuery,
  setActiveAddTag,
  setAddTagValue,
  setActiveRenameTag,
  setRenameValue,
  setActiveMergeTag,
  setMergeTargetValue,
  setActiveDeleteTag,
  isPending,
}: TagsCurationTableProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 5, p: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          pb: 3,
          mb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "extrabold", color: "text.primary" }}>
          Active Taxonomy Register
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", sm: "auto" } }}>
          <TextField
            size="small"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 240 },
              "& .MuiOutlinedInput-root": { borderRadius: 3 },
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setActiveAddTag(true);
              setAddTagValue("");
            }}
            sx={{ borderRadius: 3, fontWeight: "bold", textTransform: "none", whiteSpace: "nowrap" }}
          >
            Add Tag
          </Button>
        </Box>
      </Box>

      {filteredTags.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "medium" }}>
            No classifications found matching search filter.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "extrabold", textTransform: "uppercase", fontSize: "0.6875rem", color: "text.secondary" }}>
                  Tag Reference
                </TableCell>
                <TableCell sx={{ fontWeight: "extrabold", textTransform: "uppercase", fontSize: "0.6875rem", color: "text.secondary" }}>
                  Frequency
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "extrabold", textTransform: "uppercase", fontSize: "0.6875rem", color: "text.secondary" }}>
                  Curation Operations
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTags.map((tagInfo) => (
                <TableRow key={tagInfo.tag} hover>
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={tagInfo.tag}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        fontFamily: "monospace",
                        fontSize: "0.8125rem",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={`${tagInfo.count} times`}
                      color="primary"
                      variant="filled"
                      size="small"
                      sx={{
                        fontWeight: "black",
                        fontSize: "0.75rem",
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Box sx={{ display: "inline-flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isPending}
                        onClick={() => {
                          setActiveRenameTag(tagInfo);
                          setRenameValue(tagInfo.tag);
                        }}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="info"
                        disabled={isPending}
                        onClick={() => {
                          setActiveMergeTag(tagInfo);
                          setMergeTargetValue("");
                        }}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}
                      >
                        Merge
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={isPending}
                        onClick={() => setActiveDeleteTag(tagInfo)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: "bold" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
