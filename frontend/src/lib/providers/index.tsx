"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";

const devtoolsEnabled = process.env.NODE_ENV !== "production";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        {devtoolsEnabled ? (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
