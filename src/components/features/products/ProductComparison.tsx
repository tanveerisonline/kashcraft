"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ComparisonSpec {
  name: string;
  values: string[];
  isDifferent: boolean;
}

interface ProductComparison {
  specs: ComparisonSpec[];
}

interface ProductComparisonProps {
  productIds: string[];
}

export function ProductComparison({ productIds }: ProductComparisonProps) {
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productIds.length < 2) {
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/products/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });

        if (!res.ok) throw new Error("Failed to fetch comparison");
        const data = await res.json();
        setComparison(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading comparison");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [productIds]);

  if (loading) return <div className="skeleton h-96" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!comparison || productIds.length < 2)
    return <p className="py-8 text-center">Select 2+ products to compare</p>;

  return (
    <div className="bg-base-100 overflow-x-auto rounded-lg shadow">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Specification</th>
            {productIds.map((id) => (
              <th key={id} className="text-center">
                <button className="btn btn-ghost btn-sm">
                  <X size={16} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.specs.map((spec) => (
            <tr key={spec.name} className={spec.isDifferent ? "bg-warning bg-opacity-10" : ""}>
              <td className="font-semibold">{spec.name}</td>
              {spec.values.map((value, idx) => (
                <td key={idx} className="text-center">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
