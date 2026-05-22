import { Box } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";
import PreferencesClient from "./PreferencesClient";

export default async function PreferencesPage() {
  const session = await auth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Unified Navigation Header */}
      <Header />

      <Box
        component="main"
        sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", bgcolor: "background.default" }}
      >
        <PreferencesClient session={session} />
      </Box>

      <Footer />
    </Box>
  );
}
