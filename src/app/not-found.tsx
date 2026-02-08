"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="container-custom py-24 text-center">
        <div className="mb-8">
          <h1 className="text-primary mb-4 text-8xl font-bold">404</h1>
          <h2 className="mb-4 text-3xl font-bold">Page Not Found</h2>
          <p className="mb-8 text-lg text-gray-600">
            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Browse Products
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-card rounded-lg border p-6">
            <div className="mb-4 text-4xl">🏠</div>
            <h3 className="mb-2 font-semibold">Homepage</h3>
            <p className="mb-4 text-sm text-gray-600">Return to the main page</p>
            <Link href="/" className="text-primary text-sm font-medium hover:underline">
              Go Home →
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="mb-4 text-4xl">🛍️</div>
            <h3 className="mb-2 font-semibold">Products</h3>
            <p className="mb-4 text-sm text-gray-600">Continue shopping</p>
            <Link href="/products" className="text-primary text-sm font-medium hover:underline">
              Browse All →
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="mb-4 text-4xl">📞</div>
            <h3 className="mb-2 font-semibold">Contact Us</h3>
            <p className="mb-4 text-sm text-gray-600">Need help?</p>
            <Link href="/contact" className="text-primary text-sm font-medium hover:underline">
              Get Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
