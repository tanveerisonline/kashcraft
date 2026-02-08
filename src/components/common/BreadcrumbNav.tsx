"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: Breadcrumb[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <div className="breadcrumbs py-4 text-sm">
      <ul className="flex items-center gap-2">
        <li>
          <Link href="/">Home</Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx}>
            <ChevronRight size={16} className="mx-1" />
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
