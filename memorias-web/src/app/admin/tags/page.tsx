import React from "react";
import { Header } from "@/components/Header";
import { getTagsWithCountsAdmin } from "./actions";
import { TagsCurationClient } from "./TagsCurationClient";

export const metadata = {
  title: "Tag Curation Dashboard - Memorias Admin",
  description: "Search, merge, rename, and delete laboratory taxonomy tags globally across all records.",
};

export default async function AdminTagsPage() {
  const initialTags = await getTagsWithCountsAdmin();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
        <TagsCurationClient initialTags={initialTags} />
      </main>
    </div>
  );
}
