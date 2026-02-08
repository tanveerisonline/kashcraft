"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

interface PromoCodeFormProps {
  onApply?: (code: string, discount: number) => void;
}

export function PromoCodeForm({ onApply }: PromoCodeFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal: 0 }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setMessage({ type: "success", text: `Code applied! ${data.discountValue}% OFF` });
        onApply?.(code, data.estimatedDiscount || 0);
        setCode("");
      } else {
        setMessage({ type: "error", text: "Invalid promo code" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error applying code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Promo Code</span>
      </label>
      <div className="join w-full">
        <input
          type="text"
          placeholder="Enter code"
          className="join-item input input-bordered flex-1"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button
          className="join-item btn btn-primary"
          onClick={handleApply}
          disabled={loading || !code}
        >
          {loading ? "Applying..." : <Tag size={18} />}
        </button>
      </div>
      {message && (
        <p
          className={`label-text mt-2 ${message.type === "success" ? "text-success" : "text-error"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
