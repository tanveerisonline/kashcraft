"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export function PointsDisplay() {
  const { data: session } = useSession();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPoints = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/loyalty");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPoints(data.availablePoints || 0);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [session]);

  if (!session?.user?.id) return null;
  if (loading) return <div className="skeleton h-12 w-40" />;

  return (
    <div className="badge badge-lg bg-warning text-warning-content gap-2 px-4 py-4">
      <Zap size={18} />
      <span className="font-bold">{points} Points</span>
    </div>
  );
}
