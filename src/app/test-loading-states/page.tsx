"use client";

import React, { useState, useEffect } from "react";
import Spinner from "@/components/ui/loading/spinner";
import Skeleton from "@/components/ui/loading/skeleton";
import LoadingOverlay from "@/components/ui/loading/loading-overlay";
import ProgressBar from "@/components/ui/loading/progress-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TestLoadingStatesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [overlayLoading, setOverlayLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (overlayLoading) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setOverlayLoading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(progressInterval);
    } else {
      setProgress(0);
    }
  }, [overlayLoading]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Loading States Test Page</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Spinner</h2>
        <div className="flex justify-center space-x-4">
          <Spinner size="small" />
          <Spinner size="medium" />
          <Spinner size="large" />
          <Spinner className="text-blue-500" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-medium mb-2">Card Skeleton</h3>
            <Skeleton type="card" className="h-48" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Image Skeleton</h3>
            <Skeleton type="image" className="h-40 w-full" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Text Skeleton</h3>
            <Skeleton type="text" count={5} className="w-full" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Custom Skeleton</h3>
            <Skeleton type="custom" width="100%" height="80px" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">LoadingOverlay</h2>
        <div className="relative h-64 w-full border rounded-md p-4">
          <LoadingOverlay isLoading={overlayLoading}>
            <p className="text-center text-gray-600">
              Content that will be overlaid during loading.
            </p>
            <Button
              onClick={() => setOverlayLoading(true)}
              className="mt-4 block mx-auto"
              disabled={overlayLoading}
            >
              {overlayLoading ? "Loading..." : "Simulate Overlay Load"}
            </Button>
          </LoadingOverlay>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">ProgressBar</h2>
        <div className="w-full max-w-md mx-auto">
          <ProgressBar value={progress} className="mb-2" />
          <p className="text-center text-sm text-gray-600">{progress}% Complete</p>
          <Button
            onClick={() => setOverlayLoading(true)}
            className="mt-4 block mx-auto"
            disabled={overlayLoading}
          >
            Start Progress
          </Button>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Combined Example</h2>
        <Card className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton type="image" className="h-48 w-full" />
              <Skeleton type="text" count={3} />
              <Skeleton type="custom" width="100px" height="40px" />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-2">Loaded Content</h3>
              <p>
                This content appears after the initial loading state.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <Button className="mt-4">Action Button</Button>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};

export default TestLoadingStatesPage;
