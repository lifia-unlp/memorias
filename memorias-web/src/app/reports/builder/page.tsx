import React from "react";
import { Header } from "@/components/Header";
import ReportBuilderClient from "./ReportBuilderClient";

export default function ReportBuilderPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900/50">
      
      {/* Server-side Header - perfectly isolated from client Webpack bundles */}
      <Header />

      {/* Client-side Workspace */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-8">
        <ReportBuilderClient />
      </div>

    </div>
  );
}
