"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface LoyaltyAccount {
  currentTier: string;
  totalPoints: number;
  availablePoints: number;
  totalSpent: number;
  tierProgress: number;
}

export function LoyaltyCard() {
  const { data: session } = useSession();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAccount = async () => {
      try {
        const res = await fetch("/api/v1/loyalty");
        const data = await res.json();
        setAccount(data.account);
      } catch (error) {
        console.error("Failed to fetch loyalty account:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [session?.user?.id]);

  if (loading) return <div className="skeleton h-40 w-full" />;
  if (!account) return null;

  const tierColors: Record<string, string> = {
    bronze: "bg-orange-100 border-orange-300",
    silver: "bg-gray-100 border-gray-300",
    gold: "bg-yellow-100 border-yellow-300",
    platinum: "bg-blue-100 border-blue-300",
  };

  return (
    <div className={`card border-2 p-6 ${tierColors[account.currentTier]}`}>
      <h2 className="card-title text-2xl capitalize">{account.currentTier} Member</h2>

      <div className="my-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Available Points</p>
          <p className="text-2xl font-bold">{account.availablePoints}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Points</p>
          <p className="text-2xl font-bold">{account.totalPoints}</p>
        </div>
      </div>

      <div className="my-4">
        <h3 className="mb-2 font-semibold">Progress to Next Tier</h3>
        <progress className="progress w-full" value={account.tierProgress} max="100" />
        <p className="mt-1 text-sm text-gray-600">${account.totalSpent} of $5000 spent</p>
      </div>

      <button className="btn btn-primary w-full">Redeem Points</button>
    </div>
  );
}
