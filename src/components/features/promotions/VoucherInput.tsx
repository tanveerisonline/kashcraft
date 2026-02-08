"use client";

import { useState } from "react";

interface VoucherInputProps {
  orderTotal: number;
  onApply?: (discount: number) => void;
}

export function VoucherInput({ orderTotal, onApply }: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    discountType?: string;
    discountValue?: number;
    estimatedDiscount?: number;
    error?: string;
  } | null>(null);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal }),
      });

      const data = await res.json();
      setResult(data);

      if (data.valid && onApply && data.estimatedDiscount) {
        onApply(data.estimatedDiscount);
      }
    } catch (error) {
      setResult({ valid: false, error: "Validation failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">Voucher Code</span>
      </label>
      <div className="join w-full">
        <input
          type="text"
          placeholder="VC-XXXXXX"
          className="join-item input input-bordered flex-1"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button
          className="join-item btn btn-primary"
          onClick={handleValidate}
          disabled={loading || !code}
        >
          {loading ? "Checking..." : "Apply"}
        </button>
      </div>
      {result && (
        <p className={`label-text mt-2 ${result.valid ? "text-success" : "text-error"}`}>
          {result.valid
            ? `${result.discountType === "percentage" ? result.discountValue + "%" : "$" + result.discountValue} OFF - Save $${result.estimatedDiscount}`
            : result.error || "Invalid code"}
        </p>
      )}
    </div>
  );
}
