"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  showPageSizeSelector?: boolean;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  showPageSizeSelector,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderPageNumbers = () => {
    if (totalPages <= 7) {
      return pages.map((page) => (
        <PaginationItem
          key={page}
          isActive={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PaginationItem>
      ));
    }

    const startPages = pages.slice(0, 3);
    const endPages = pages.slice(totalPages - 3, totalPages);
    const middlePage = currentPage;

    if (currentPage <= 4) {
      return (
        <>
          {startPages.map((page) => (
            <PaginationItem
              key={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationItem>
          ))}
          <PaginationEllipsis />
          {endPages.map((page) => (
            <PaginationItem
              key={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationItem>
          ))}
        </>
      );
    }

    if (currentPage >= totalPages - 3) {
      return (
        <>
          {startPages.map((page) => (
            <PaginationItem
              key={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationItem>
          ))}
          <PaginationEllipsis />
          {endPages.map((page) => (
            <PaginationItem
              key={page}
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationItem>
          ))}
        </>
      );
    }

    return (
      <>
        {startPages.map((page) => (
          <PaginationItem
            key={page}
            isActive={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationItem>
        ))}
        <PaginationEllipsis />
        <PaginationItem isActive={true} onClick={() => onPageChange(middlePage)}>
          {middlePage}
        </PaginationItem>
        <PaginationEllipsis />
        {endPages.map((page) => (
          <PaginationItem
            key={page}
            isActive={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationItem>
        ))}
      </>
    );
  };

  return (
    <nav role="navigation" aria-label="Pagination" className="mx-auto flex w-full justify-center">
      <ul className="flex flex-row items-center gap-1">
        <PaginationPrevious
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {renderPageNumbers()}
        <PaginationNext
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </ul>
    </nav>
  );
}
Pagination.displayName = "Pagination";

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}
PaginationContent.displayName = "PaginationContent";

interface PaginationItemProps
  extends React.ComponentProps<"a">,
    VariantProps<typeof buttonVariants> {
  isActive?: boolean;
}

function PaginationItem({
  className,
  isActive,
  variant,
  size,
  ...props
}: PaginationItemProps) {
  return (
    <li>
      <PaginationLink
        aria-current={isActive ? "page" : undefined}
        variant={isActive ? "outline" : variant}
        size={size}
        className={cn(className)}
        {...props}
      />
    </li>
  );
}
PaginationItem.displayName = "PaginationItem";

interface PaginationLinkProps
  extends React.ComponentProps<"a">,
    VariantProps<typeof buttonVariants> {}

function PaginationLink({ className, variant, size, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current="page"
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className
      )}
      {...props}
    />
  );
}
PaginationLink.displayName = "PaginationLink";

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationButton>) {
  return (
    <PaginationButton
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationButton>
  );
}
PaginationPrevious.displayName = "PaginationPrevious";

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationButton>) {
  return (
    <PaginationButton
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationButton>
  );
}
PaginationNext.displayName = "PaginationNext";

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
PaginationEllipsis.displayName = "PaginationEllipsis";

function PaginationButton({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: ButtonProps) {
  return (
    <li className="flex">
      <button
        aria-current="page"
        className={cn(
          buttonVariants({
            variant,
            size,
          }),
          className
        )}
        {...props}
      />
    </li>
  );
}
PaginationButton.displayName = "PaginationButton";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
