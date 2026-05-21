"use client";

import { useEffect } from "react";

interface ClientRedirectProps {
  to: string;
}

export default function ClientRedirect({ to }: ClientRedirectProps) {
  useEffect(() => {
    // Use window.location.replace to force a full browser page load,
    // ensuring the browser cookie jar is updated and the middleware
    // re-evaluates the fresh cookie on the next request.
    window.location.replace(to);
  }, [to]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-muted">
          Updating your session...
        </p>
      </div>
    </div>
  );
}
