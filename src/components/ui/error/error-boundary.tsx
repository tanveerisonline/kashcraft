"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorMessage from "./error-message"; // Assuming ErrorMessage will be created next

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You can also log error messages to an error reporting service here
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorMessage
          title="Something went wrong."
          message={this.state.error?.message || "An unexpected error occurred."}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
