"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { useSession } from "next-auth/react";

interface RedeemPointsModalProps {
  availablePoints?: number;
}

export function RedeemPointsModal({ availablePoints = 0 }: RedeemPointsModalProps) {
  const { data: session } = useSession();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const pointValue = points * 0.01; // 100 points = $1

  const handleRedeem = async () => {
    if (points > availablePoints) {
      setResult("Insufficient points");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", points }),
      });

      const data = await res.json();
      setResult(res.ok ? `Successfully redeemed ${points} points!` : "Redemption failed");
      if (res.ok) {
        setTimeout(() => {
          setPoints(0);
          setResult(null);
        }, 3000);
      }
    } catch (err) {
      setResult("Error redeeming points");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.id) return <p className="text-center">Please log in</p>;

  return (
    <>
      <button
        className="btn btn-primary gap-2"
        onClick={() => (document.getElementById("redeem_modal") as any)?.showModal()}
      >
        <Gift size={16} /> Redeem Points
      </button>

      <dialog id="redeem_modal" className="modal">
        <div className="modal-box">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Gift size={20} /> Redeem Points
          </h3>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Points to Redeem</span>
                <span className="label-text-alt text-success">Available: {availablePoints}</span>
              </label>
              <input
                type="number"
                min="0"
                max={availablePoints}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="card bg-primary text-primary-content">
              <div className="card-body p-4">
                <p className="text-sm">Redemption Value:</p>
                <p className="text-3xl font-bold">${pointValue.toFixed(2)}</p>
              </div>
            </div>

            {result && (
              <p
                className={`text-center text-sm ${result.includes("Successfully") ? "text-success" : "text-error"}`}
              >
                {result}
              </p>
            )}

            <div className="modal-action">
              <button
                className="btn btn-primary flex-1"
                onClick={handleRedeem}
                disabled={loading || points === 0 || points > availablePoints}
              >
                {loading ? "Processing..." : "Redeem"}
              </button>
              <form method="dialog">
                <button className="btn btn-ghost">Close</button>
              </form>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </>
  );
}
