import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

interface PublicationWizardProps {
  ingestionMethod: "select" | "doi" | "bibtex" | "form";
  setIngestionMethod: (method: "select" | "doi" | "bibtex" | "form") => void;
  doiInput: string;
  setDoiInput: (val: string) => void;
  bibInput: string;
  setBibInput: (val: string) => void;
  ingestionError: string;
  isPending: boolean;
  handleDoiImport: () => void;
  handleBibtexParse: () => void;
}

export function PublicationWizard({
  ingestionMethod,
  setIngestionMethod,
  doiInput,
  setDoiInput,
  bibInput,
  setBibInput,
  ingestionError,
  isPending,
  handleDoiImport,
  handleBibtexParse,
}: PublicationWizardProps) {
  // 1. Select Wizard UI
  if (ingestionMethod === "select") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
            How would you like to add the publication?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
            Choose an ingestion path to instantly resolve, populate, and pre-fill publication metadata.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: "center" }}>
          {/* Card 1: DOI */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              onClick={() => setIngestionMethod("doi")}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "between",
                textAlign: "center",
                p: 3,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                  Import with DOI
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Paste a Digital Object Identifier (DOI) and query research metadata directly from CrossRef.
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select DOI Import
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: BibTeX */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              onClick={() => setIngestionMethod("bibtex")}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "between",
                textAlign: "center",
                p: 3,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                  Parse from BibTeX
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Paste a raw BibTeX citation entry. We will automatically parse, clean, and populate the attributes.
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select BibTeX Ingest
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Manual */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              onClick={() => setIngestionMethod("form")}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "between",
                textAlign: "center",
                p: 3,
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 3,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                  Add Manually
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Skip the auto-ingestion path and jump straight to building an empty manual bibliography.
                </Typography>
                <Button variant="text" size="small" color="primary" sx={{ mt: 3, fontWeight: "bold" }}>
                  Start Manually
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 2. DOI Wizard View
  if (ingestionMethod === "doi") {
    return (
      <Card variant="outlined" sx={{ maxWidth: 500, mx: "auto", borderRadius: 4, p: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Button
              onClick={() => setIngestionMethod("select")}
              variant="text"
              size="small"
              sx={{ fontWeight: "bold", mb: 1, p: 0 }}
            >
              Back to options
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Import via DOI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Provide a DOI identifier (e.g. 10.1007/978-3-030-30796-7_4).
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="DOI Reference"
              placeholder="e.g. 10.1007/..."
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              size="small"
              slotProps={{
                htmlInput: { style: { fontFamily: "monospace" } }
              }}
            />

            {ingestionError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {ingestionError}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleDoiImport}
              disabled={isPending}
              fullWidth
              sx={{ py: 1.2, fontWeight: "bold", borderRadius: 2 }}
            >
              {isPending ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="button">Resolving DOI...</Typography>
                </Box>
              ) : (
                "Resolve and Pre-fill Form"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 3. BibTeX Wizard View
  if (ingestionMethod === "bibtex") {
    return (
      <Card variant="outlined" sx={{ maxWidth: 600, mx: "auto", borderRadius: 4, p: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Button
              onClick={() => setIngestionMethod("select")}
              variant="text"
              size="small"
              sx={{ fontWeight: "bold", mb: 1, p: 0 }}
            >
              Back to options
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Parse from BibTeX
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Paste the raw BibTeX entry source.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="BibTeX Source Code"
              placeholder="@article{silva2025, ...}"
              value={bibInput}
              onChange={(e) => setBibInput(e.target.value)}
              slotProps={{
                htmlInput: { style: { fontFamily: "monospace", fontSize: "0.75rem" } }
              }}
            />

            {ingestionError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {ingestionError}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleBibtexParse}
              disabled={isPending}
              fullWidth
              sx={{ py: 1.2, fontWeight: "bold", borderRadius: 2 }}
            >
              {isPending ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="button">Parsing BibTeX...</Typography>
                </Box>
              ) : (
                "Parse and Pre-fill Form"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return null;
}
