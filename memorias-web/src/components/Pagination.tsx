import React from "react";
import { LinkButton, LinkIconButton, LinkListItemButton } from "@/components/reusable/LinkComponents";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentSearchParams: Record<string, string | number | string[] | undefined>;
  baseUrl: string;
}

export function Pagination({
  currentPage,
  totalPages,
  currentSearchParams,
  baseUrl,
}: PaginationProps) {
  // If there's 1 or fewer pages, pagination is unnecessary
  if (totalPages <= 1) return null;

  // Helper to build URL with preserved search parameters
  const createPageLink = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(currentSearchParams).forEach(([key, value]) => {
      // Exclude 'page' to override it, and filter out undefined/null values
      if (value !== undefined && value !== null && key !== "page") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    params.set("page", page.toString());
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Generate page ranges with collapsing ellipsis (e.g. 1, 2, ..., 5, 6)
  const range: (number | string)[] = [];
  const delta = 1; // Number of pages to show around current page
  const left = currentPage - delta;
  const right = currentPage + delta + 1;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mt: 4,
        pt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Informative counter */}
      <Typography variant="body2" color="text.secondary">
        Page{" "}
        <Typography component="span" variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
          {currentPage}
        </Typography>{" "}
        of{" "}
        <Typography component="span" variant="body2" sx={{ fontWeight: "bold", color: "text.primary" }}>
          {totalPages}
        </Typography>
      </Typography>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {/* Previous Button */}
        {currentPage > 1 ? (
          <LinkButton 
            href={createPageLink(currentPage - 1)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Previous
          </LinkButton>
        ) : (
          <Button variant="outlined" size="small" disabled sx={{ borderRadius: 2 }}>
            Previous
          </Button>
        )}

        {/* Page Buttons */}
        {range.map((page, index) => {
          if (page === "...") {
            return (
              <Typography
                key={`dots-${index}`}
                variant="body2"
                color="text.disabled"
                sx={{ width: 32, textAlign: "center", fontWeight: "bold" }}
              >
                ...
              </Typography>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <LinkButton key={page}
              
              href={createPageLink(page as number)}
              variant={isCurrent ? "contained" : "outlined"}
              size="small"
              sx={{
                minWidth: 32,
                height: 32,
                p: 0,
                borderRadius: 2,
                fontWeight: "bold",
              }}
            >
              {page}
            </LinkButton>
          );
        })}

        {/* Next Button */}
        {currentPage < totalPages ? (
          <LinkButton 
            href={createPageLink(currentPage + 1)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Next
          </LinkButton>
        ) : (
          <Button variant="outlined" size="small" disabled sx={{ borderRadius: 2 }}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
