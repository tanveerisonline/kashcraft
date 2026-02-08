"use client";

import React from "react";
import { Badge } from "@/components/ui/badge/badge";
import StatusBadge from "@/components/ui/badge/status-badge";
import StockBadge from "@/components/ui/badge/stock-badge";
import { Card } from "@/components/ui/card";

const TestBadgeSystemPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Badge System Test Page</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Base Badge Component</h2>
        <Card className="p-6 flex flex-wrap gap-4 justify-center">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Status Badge Component</h2>
        <Card className="p-6 flex flex-wrap gap-4 justify-center">
          <StatusBadge status="pending" />
          <StatusBadge status="processing" />
          <StatusBadge status="shipped" />
          <StatusBadge status="delivered" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="refunded" />
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Stock Badge Component</h2>
        <Card className="p-6 flex flex-wrap gap-4 justify-center">
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
