"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (Sentry, etc.)
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#f9fafb",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              maxWidth: "500px",
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                margin: "0 0 1rem 0",
              }}
            >
              Critical Error
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#6b7280",
                marginBottom: "2rem",
                margin: "0 0 2rem 0",
              }}
            >
              A critical error occurred. We're working to fix it. Please try refreshing the page.
            </p>

            {error.message && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.375rem",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    color: "#991b1b",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {error.message}
                </p>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  padding: "0.625rem 1.5rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  padding: "0.625rem 1.5rem",
                  backgroundColor: "transparent",
                  color: "#3b82f6",
                  border: "1px solid #3b82f6",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f9ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
