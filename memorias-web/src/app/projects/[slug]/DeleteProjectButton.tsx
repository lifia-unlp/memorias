"use client";

import React, { useState } from "react";
import { deleteProject } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
} from "@mui/material";

interface RefObj {
  title: string;
  slug: string;
}

interface References {
  theses: RefObj[];
  scholarships: RefObj[];
  publications: RefObj[];
}

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refBlock, setRefBlock] = useState<References | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProject(projectId);
      if (res.success) {
        setShowConfirm(false);
        router.push("/projects");
      } else if (res.error === "REFERENTIAL_BLOCK" && res.references) {
        setRefBlock(res.references);
        setShowConfirm(false);
      } else {
        alert("An error occurred during deletion.");
      }
    } catch (err: any) {
      alert(err.message || "Unauthorized action.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        onClick={() => setShowConfirm(true)}
        sx={{ borderRadius: 3, fontWeight: "bold" }}
      >
        Delete Project
      </Button>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirm}
        onClose={() => !isDeleting && setShowConfirm(false)}
        aria-labelledby="confirm-delete-dialog-title"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle id="confirm-delete-dialog-title" sx={{ fontWeight: "bold", color: "error.main" }}>
          Delete Project?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.primary" }}>
            Are you sure you want to delete <strong>{projectTitle}</strong>? This action is permanent and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Referral Block Dialog */}
      <Dialog
        open={Boolean(refBlock)}
        onClose={() => setRefBlock(null)}
        aria-labelledby="ref-block-dialog-title"
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle id="ref-block-dialog-title" sx={{ fontWeight: "bold", color: "error.main" }}>
          Cannot Delete Project
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <DialogContentText sx={{ color: "text.primary", fontWeight: 500, fontSize: "0.875rem" }}>
            Active database references detected. Before deleting <strong>{projectTitle}</strong>, you must manually remove or update its association in the following objects. Click the links below to navigate directly to each object and resolve:
          </DialogContentText>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Theses */}
            {refBlock && refBlock.theses.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
                  Referenced Theses ({refBlock.theses.length})
                </Typography>
                <Box sx={{ bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1 }}>
                  <List dense disablePadding>
                    {refBlock.theses.map((t, i) => (
                      <ListItem key={i} disablePadding>
                        <Button
                          component={Link}
                          href={`/theses/${t.slug}`}
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            width: "100%",
                            py: 0.5,
                            textAlign: "left",
                            color: "primary.main",
                          }}
                        >
                          {t.title}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            )}

            {/* Scholarships */}
            {refBlock && refBlock.scholarships.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
                  Referenced Scholarships ({refBlock.scholarships.length})
                </Typography>
                <Box sx={{ bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1 }}>
                  <List dense disablePadding>
                    {refBlock.scholarships.map((s, i) => (
                      <ListItem key={i} disablePadding>
                        <Button
                          component={Link}
                          href={`/scholarships/${s.slug}`}
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            width: "100%",
                            py: 0.5,
                            textAlign: "left",
                            color: "primary.main",
                          }}
                        >
                          {s.title}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            )}

            {/* Publications */}
            {refBlock && refBlock.publications.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
                  Referenced Publications ({refBlock.publications.length})
                </Typography>
                <Box sx={{ bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1 }}>
                  <List dense disablePadding>
                    {refBlock.publications.map((pb, i) => (
                      <ListItem key={i} disablePadding>
                        <Button
                          component={Link}
                          href={`/publications/${pb.slug}`}
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            width: "100%",
                            py: 0.5,
                            textAlign: "left",
                            color: "primary.main",
                          }}
                        >
                          {pb.title}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRefBlock(null)}
            variant="contained"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Dismiss Warning
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
