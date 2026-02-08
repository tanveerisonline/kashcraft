"use client";

import React, { useState } from "react";
import ErrorBoundary from "@/components/ui/error/error-boundary";
import ErrorMessage from "@/components/ui/error/error-message";
import NotFound from "@/components/ui/error/not-found";
import ServerError from "@/components/ui/error/server-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// A component that intentionally throws an error
const BuggyComponent: React.FC = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    throw new Error("I crashed!");
  }

  return (
    <Button onClick={() => setShouldThrowError(true)} variant="destructive">
      Trigger Error
    </Button>
  );
};

const TestErrorStatesPage: React.FC = () => {
  const handleRetry = () => {
    alert("Retrying action...");
    // In a real app, you'd re-fetch data or reset state here
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Error States Test Page</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ErrorBoundary</h2>
        <Card className="p-6 flex justify-center">
          <ErrorBoundary
            fallback={
              <ErrorMessage
                title="Component Error"
                message="This component failed to render."
                onRetry={() => console.log("ErrorBoundary retry")}
              />
            }
          >
            <BuggyComponent />
          </ErrorBoundary>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ErrorMessage</h2>
        <Card className="p-6">
          <ErrorMessage
            title="Data Fetch Error"
            message="Failed to load user data. Please check your internet connection."
            onRetry={handleRetry}
          />
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">NotFound (404)</h2>
        <Card className="p-6">
          <NotFound
            message="The product you were looking for could not be found."
            linkText="Browse Products"
            linkHref="/products"
          />
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ServerError (500)</h2>
        <Card className="p-6">
          <ServerError
            message="Our servers are experiencing issues. We're working on it!"
            linkText="Go to Dashboard"
            linkHref="/dashboard"
          />
        </Card>
      </section>
    </div>
  );
};

export default TestErrorStatesPage;
