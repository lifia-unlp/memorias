import React from "react";
import { Box, Typography, Button, Dialog, DialogContent, Chip } from "@mui/material";
import { AcmCcsSelector } from "@/components/AcmCcsSelector";
import { getAcmCcsPath } from "@/lib/acm-ccs-utils";

interface AcmCcsSectionProps {
  initialData?: any;
  acmInterests: string[];
  setAcmInterests: (ids: string[]) => void;
  isAcmSelectorOpen: boolean;
  setIsAcmSelectorOpen: (open: boolean) => void;
  isLegacyText: boolean;
  plainTextPaths: string;
}

export function AcmCcsSection({
  initialData,
  acmInterests,
  setAcmInterests,
  isAcmSelectorOpen,
  setIsAcmSelectorOpen,
  isLegacyText,
  plainTextPaths,
}: AcmCcsSectionProps) {
  return (
    <>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              textTransform: "uppercase",
              display: "block",
              mb: 1,
            }}
          >
            Research Interests (English - ACM CCS Classification)
          </Typography>

          {/* Hidden form input holding serialized array for actual POST submit */}
          <input type="hidden" name="interestsInEnglish" value={JSON.stringify(acmInterests)} />

          {/* Display legacy warning if needed */}
          {isLegacyText && acmInterests.length === 0 ? (
            <Box
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "warning.light",
                bgcolor: "rgba(247, 144, 9, 0.03)",
                borderRadius: 1.5,
                mb: 1.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: "warning.dark",
                  display: "block",
                  mb: 0.5,
                }}
              >
                Legacy Text Interests Found:
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.primary",
                  fontStyle: "italic",
                  display: "block",
                  wordBreak: "break-word",
                }}
              >
                "{initialData.interestsInEnglish}"
              </Typography>
            </Box>
          ) : null}

          {/* Active ACM Categories list */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {acmInterests.length === 0 && (!isLegacyText || acmInterests.length > 0) ? (
              <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                No categories selected.
              </Typography>
            ) : (
              acmInterests.map((id) => (
                <Chip
                  key={id}
                  label={getAcmCcsPath(id).join(" > ")}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: "0.72rem", borderRadius: 1 }}
                />
              ))
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setIsAcmSelectorOpen(true)}
            sx={{ textTransform: "none", fontWeight: "bold", fontSize: "0.72rem", py: 0.25 }}
          >
            {acmInterests.length > 0
              ? "Edit Classifications"
              : isLegacyText
              ? "Migrate to ACM Classification"
              : "Select ACM Categories"}
          </Button>
        </Box>
      </Box>

      {/* Modal Dialog housing the Selector */}
      <Dialog
        open={isAcmSelectorOpen}
        onClose={() => setIsAcmSelectorOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Select Research Interests (ACM CCS Taxonomy)
          </Typography>
          <Button
            onClick={() => setIsAcmSelectorOpen(false)}
            variant="contained"
            size="small"
            sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1.5 }}
          >
            Done
          </Button>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <AcmCcsSelector
            initialValue={JSON.stringify(acmInterests)}
            onChange={(newIds) => setAcmInterests(newIds)}
          />
        </DialogContent>
      </Dialog>

      {/* Hidden input storing full taxonomy paths in interestsInSpanish as a search index */}
      <input type="hidden" name="interestsInSpanish" value={plainTextPaths} />
    </>
  );
}
