"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/tooltip/popover";
import { Card } from "@/components/ui/card";

const TestTooltipPopoverSystemPage: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <h1 className="mb-8 text-center text-3xl font-bold">Tooltip & Popover System Test Page</h1>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Tooltip Component</h2>
          <Card className="flex justify-center p-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip!</p>
              </TooltipContent>
            </Tooltip>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Popover Component</h2>
          <Card className="flex justify-center p-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">Dimensions</h4>
                    <p className="text-muted-foreground text-sm">
                      Set the dimensions for the layer.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor="width">Width</label>
                      <input id="width" defaultValue="100%" className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor="maxWidth">Max. width</label>
                      <input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor="height">Height</label>
                      <input id="height" defaultValue="25px" className="col-span-2 h-8" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor="maxHeight">Max. height</label>
                      <input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </Card>
        </section>
      </div>
    </TooltipProvider>
  );
};

export default TestTooltipPopoverSystemPage;
