"use client";

import React from "react";
import { Badge } from "@/components/ui/badge/badge";
import StatusBadge from "@/components/ui/badge/status-badge";
import StockBadge from "@/components/ui/badge/stock-badge";
import { Card } from "@/components/ui/card";

const TestBadgeSystemPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">Badge System Test Page</h1>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Base Badge Component</h2>
        <Card className="flex flex-wrap justify-center gap-4 p-6">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Status Badge Component</h2>
        <Card className="flex flex-wrap justify-center gap-4 p-6">
          <StatusBadge status="pending" />
          <StatusBadge status="processing" />
          <StatusBadge status="shipped" />
          <StatusBadge status="delivered" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="refunded" />
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Stock Badge Component</h2>
        <Card className="flex flex-wrap justify-center gap-4 p-6">
          <StockBadge stock={15} />
          <StockBadge stock={5} />
          <StockBadge stock={0} />
          <StockBadge stock={1} lowStockThreshold={3} />
          <StockBadge stock={100} lowStockThreshold={50} />
        </Card>
      </section>
    </div>
  );
};

export default TestBadgeSystemPage;
