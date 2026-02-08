"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { Card } from "@/components/ui/card";

const TestToastSystemPage: React.FC = () => {
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">Toast System Test Page</h1>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Basic Toasts</h2>
        <Card className="flex flex-wrap justify-center gap-4 p-6">
          <Button
            onClick={() =>
              toast({
                title: "Success!",
                description: "Your action was completed successfully.",
                type: "success",
              })
            }
          >
            Show Success Toast
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Error!",
                description: "Something went wrong. Please try again.",
                type: "error",
              })
            }
            variant="destructive"
          >
            Show Error Toast
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Warning!",
                description: "This action cannot be undone.",
                type: "warning",
              })
            }
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            Show Warning Toast
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Info!",
                description: "Here is some general information.",
                type: "info",
              })
            }
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Show Info Toast
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Default Toast",
                description: "This is a default toast notification.",
                type: "default",
              })
            }
            variant="outline"
          >
            Show Default Toast
          </Button>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Toast with Action</h2>
        <Card className="flex justify-center p-6">
          <Button
            onClick={() =>
              toast({
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
                action: (
                  <Button
                    variant="link"
                    onClick={() => alert("Action clicked!")}
                    className="text-white"
                  >
                    Undo
                  </Button>
                ),
                type: "error",
              })
            }
          >
            Show Toast with Action
          </Button>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Longer Toast</h2>
        <Card className="flex justify-center p-6">
          <Button
            onClick={() =>
              toast({
                title: "Scheduled: Catch up",
                description: "Friday, February 10, 2023 at 5:57 PM",
                type: "info",
              })
            }
          >
            Show Longer Toast
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default TestToastSystemPage;
