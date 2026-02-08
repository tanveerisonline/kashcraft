"use client";

import { useState } from "react";

interface GiftCardInputProps {
  onApply?: (amount: number) => void;
}

export function GiftCardInput({ onApply }: GiftCardInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    balance?: number;
    error?: string;
  } | null>(null);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "validate" }),
      });

      const data = await res.json();
      setResult(data);

      if (data.valid && onApply && data.balance) {
        onApply(data.balance);
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
        <span className="label-text">Gift Card Code</span>
      </label>
      <div className="join w-full">
        <input
          type="text"
          placeholder="GC-XXXX-XXXX-XXXX-XXXX"
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
          {result.valid ? `Valid! Balance: $${result.balance}` : result.error || "Invalid code"}
        </p>
      )}
    </div>
  );
}
