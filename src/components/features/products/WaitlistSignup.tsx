"use client";

import { useState } from "react";

interface WaitlistProps {
  productId: string;
  productName: string;
}

export function WaitlistSignup({ productId, productName }: WaitlistProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✓ Added to waitlist. Position: #${data.position}`);
      } else {
        setMessage("Failed to add to waitlist");
      }
    } catch (error) {
      setMessage("Error: Unable to join waitlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 mb-4 shadow-sm">
      <div className="card-body">
        <h3 className="card-title">Out of Stock</h3>
        <p className="mb-4 text-sm text-gray-600">
          Get notified when the {productName} is back in stock
        </p>
        <button className="btn btn-primary" onClick={handleSignup} disabled={loading}>
          {loading ? "Adding..." : "Join Waitlist"}
        </button>
        {message && (
          <p className={`mt-2 text-sm ${message.includes("✓") ? "text-success" : "text-error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
