"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="container-custom max-w-xl py-24 text-center">
        <div className="mb-8">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-4 text-4xl font-bold">Something Went Wrong</h1>
          <p className="mb-4 text-lg text-gray-600">
            We encountered an unexpected error. Please try again or contact support if the problem
            persists.
          </p>

          {error.message && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="font-mono text-sm break-words text-red-700">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-xs text-red-600">Error ID: {error.digest}</p>
              )}
            </div>
          )}
        </div>

        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <Button onClick={() => reset()} size="lg" className="w-full sm:w-auto">
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.href = "/")}
            className="w-full sm:w-auto"
          >
            Go to Homepage
          </Button>
        </div>

        <div className="bg-card rounded-lg border p-6 text-left">
          <h3 className="mb-3 font-semibold">Need Help?</h3>
          <p className="mb-4 text-sm text-gray-600">
            If you continue to experience issues, please reach out to our support team.
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@kashcraft.com" className="text-primary hover:underline">
                support@kashcraft.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong> 1-800-KASHCRAFT
            </p>
            <p>
              <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
