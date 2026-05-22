"use client";

import React, { useState } from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";

interface ThemeRegistryProps {
  children: React.ReactNode;
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [cache] = useState(() => {
    const c = createCache({ key: "mui" });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(" "),
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}
