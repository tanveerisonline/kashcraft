"use client";

import React from "react";
import { Pagination } from "@/components/ui/pagination/pagination";
import { Card } from "@/components/ui/card";

const TestPaginationSystemPage: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">Pagination System Test Page</h1>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Basic Pagination</h2>
        <Card className="flex justify-center p-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Card>
        <p className="mt-4 text-center">Current Page: {currentPage}</p>
      </section>
    </div>
  );
};

export default TestPaginationSystemPage;
