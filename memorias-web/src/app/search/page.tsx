import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { LinkButton } from "@/components/reusable/LinkComponents";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { MemberSearchCard } from "@/components/reusable/MemberSearchCard";
import { ProjectSearchCard } from "@/components/reusable/ProjectSearchCard";
import { ThesisSearchCard } from "@/components/reusable/ThesisSearchCard";
import { ScholarshipSearchCard } from "@/components/reusable/ScholarshipSearchCard";
import { PublicationSearchCard } from "@/components/reusable/PublicationSearchCard";
import { searchService, SearchResultItem } from "@/lib/services/searchService";

type SearchParams = Promise<{ q?: string; type?: string; page?: string; limit?: string }>;

export const metadata = {
  title: "Global Search | Memorias",
  description: "Search all members, research projects, defended theses, scholarships, and scientific publications across the repository.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const typeFilter = resolvedParams.type || "all";
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const limit = parseInt(resolvedParams.limit || "10", 10) || 10;

  const { counts, paginatedResults, totalCount, totalPages } = await searchService.search(
    q,
    typeFilter,
    page,
    limit
  );



  const filterTabs = [
    { label: "All", type: "all", count: counts.all },
    { label: "Researchers", type: "member", count: counts.member },
    { label: "Projects", type: "project", count: counts.project },
    { label: "Theses", type: "thesis", count: counts.thesis },
    { label: "Scholarships", type: "scholarship", count: counts.scholarship },
    { label: "Publications", type: "publication", count: counts.publication },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      {/* Hero Banner Section */}
      <Box
        data-component-semantics="Hero banner"
        sx={{
          background: "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
          color: "common.white",
          py: 6,
          px: 3,
          boxShadow: "inset 0px -4px 10px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 10 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h1" sx={{ color: "common.white", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
              Global Search
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.85)" }}>
              Explore researchers, scientific projects, defended theses, scholarship opportunities, and publications in our institutional repository.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Layout Container */}
      <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        
        {/* Inline Search Bar Form */}
        <Card sx={{ p: 2, boxShadow: 1 }}>
          <Box
            component="form"
            method="GET"
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <input type="hidden" name="type" value={typeFilter} />
            <TextField
              fullWidth
              size="small"
              name="q"
              defaultValue={q}
              placeholder="Search across all records by name, title, keywords, authors, notes..."
              variant="outlined"
            />

            <FormControl size="small" sx={{ width: { xs: "100%", md: 160 }, shrink: 0 }}>
              <Select name="limit" defaultValue={limit.toString()}>
                <MenuItem value="10">10 per page</MenuItem>
                <MenuItem value="20">20 per page</MenuItem>
                <MenuItem value="30">30 per page</MenuItem>
                <MenuItem value="50">50 per page</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" } }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  fontWeight: "bold",
                  flexGrow: { xs: 1, md: 0 },
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </Button>

              {(q || typeFilter !== "all" || limit !== 10) && (
                <LinkButton
                  href="/search"
                  variant="text"
                  color="inherit"
                  sx={{
                    fontWeight: "bold",
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Clear
                </LinkButton>
              )}
            </Box>
          </Box>
        </Card>

        {/* Dynamic Category Chips Filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          {filterTabs.map((tab) => {
            const isActive = typeFilter === tab.type;
            return (
              <LinkButton
                key={tab.type}
                href={`/search?q=${encodeURIComponent(q)}&type=${tab.type}&limit=${limit}`}
                variant={isActive ? "contained" : "outlined"}
                color={isActive ? "primary" : "inherit"}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: isActive ? 800 : 700,
                  fontSize: "0.8rem",
                  px: 2.25,
                  py: 0.75,
                  textTransform: "none",
                  boxShadow: isActive ? 2 : 0,
                }}
              >
                {tab.label} ({tab.count})
              </LinkButton>
            );
          })}
        </Box>

        {/* Results Info Bar */}
        {totalCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            Found {totalCount} matching results, sorted descending by last updated.
          </Typography>
        )}

        {/* Search Results List */}
        {paginatedResults.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography variant="h3">No matching records found</Typography>
            <Typography variant="body2" color="text.secondary">
              We could not find any records matching your search queries. Try broadening your keywords.
            </Typography>
          </Card>
        ) : (
          <Box>
            <Grid container spacing={3.5}>
              {paginatedResults.map((item) => {
                const renderCard = () => {
                  switch (item.type) {
                    case "member":
                      return <MemberSearchCard member={item.original} />;
                    case "project":
                      return <ProjectSearchCard project={item.original} />;
                    case "thesis":
                      return <ThesisSearchCard thesis={item.original} />;
                    case "scholarship":
                      return <ScholarshipSearchCard scholarship={item.original} />;
                    case "publication":
                      return <PublicationSearchCard publication={item.original} />;
                    default:
                      return null;
                  }
                };

                return (
                  <Grid size={{ xs: 12 }} key={`${item.type}-${item.id}`}>
                    {renderCard()}
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination Widget */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              currentSearchParams={{ q, type: typeFilter, limit }}
              baseUrl="/search"
            />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
