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
      <h1 className="text-3xl font-bold mb-8 text-center">
        Pagination System Test Page
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Basic Pagination</h2>
        <Card className="p-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Card>
        <p className="text-center mt-4">Current Page: {currentPage}</p>
      </section>
    </div>
  );
};

export default TestPaginationSystemPage;
