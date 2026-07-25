"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState error={error} onRetry={unstable_retry} homeHref="/dashboard" />;
}
