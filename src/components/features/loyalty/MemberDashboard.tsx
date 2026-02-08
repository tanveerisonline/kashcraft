"use client";

import { useState, useEffect } from "react";
import { Award, Zap, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";

interface MemberData {
  tier: string;
  points: number;
  totalSpent: number;
  joinDate: string;
  rewards?: number;
}

export function MemberDashboard() {
  const { data: session } = useSession();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchMember = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/loyalty");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMember({
          tier: data.tier || "Bronze",
          points: data.availablePoints || 0,
          totalSpent: data.totalSpent || 0,
          joinDate: data.joinDate || new Date().toISOString(),
          rewards: data.rewards || 0,
        });
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [session]);

  if (!session?.user?.id) return <p className="text-center">Please log in</p>;
  if (loading) return <div className="skeleton h-48" />;
  if (!member) return <p className="text-center">No member data</p>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white shadow">
        <div className="card-body p-4">
          <div className="flex items-center gap-2">
            <Award size={24} />
            <div>
              <p className="text-sm opacity-90">Membership Tier</p>
              <p className="text-2xl font-bold">{member.tier}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow">
        <div className="card-body p-4">
          <div className="flex items-center gap-2">
            <Zap size={24} />
            <div>
              <p className="text-sm opacity-90">Points</p>
              <p className="text-2xl font-bold">{member.points.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow">
        <div className="card-body p-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={24} />
            <div>
              <p className="text-sm opacity-90">Total Spent</p>
              <p className="text-2xl font-bold">${member.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow">
        <div className="card-body p-4">
          <div className="flex items-center gap-2">
            <Gift size={24} />
            <div>
              <p className="text-sm opacity-90">Rewards Available</p>
              <p className="text-2xl font-bold">{member.rewards}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Gift } from "lucide-react";
