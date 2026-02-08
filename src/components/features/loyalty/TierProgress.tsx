"use client";

interface TierInfo {
  name: string;
  color: string;
  minSpending: number;
  nextTierMinSpending?: number;
}

interface TierProgressProps {
  currentTier: string;
  currentSpending: number;
  nextTierSpending: number;
}

const TIERS: Record<string, TierInfo> = {
  bronze: {
    name: "Bronze",
    color: "bg-orange-700",
    minSpending: 0,
    nextTierMinSpending: 500,
  },
  silver: {
    name: "Silver",
    color: "bg-gray-400",
    minSpending: 500,
    nextTierMinSpending: 1500,
  },
  gold: {
    name: "Gold",
    color: "bg-yellow-500",
    minSpending: 1500,
    nextTierMinSpending: 5000,
  },
  platinum: {
    name: "Platinum",
    color: "bg-slate-300",
    minSpending: 5000,
    nextTierMinSpending: undefined,
  },
};

export function TierProgress({
  currentTier,
  currentSpending,
  nextTierSpending,
}: TierProgressProps) {
  const tierInfo = TIERS[currentTier.toLowerCase()];
  if (!tierInfo) return <div className="text-center">Unknown tier</div>;

  const progress = nextTierSpending
    ? ((currentSpending - tierInfo.minSpending) / (nextTierSpending - tierInfo.minSpending)) * 100
    : 100;

  const remaining = Math.max(0, nextTierSpending - currentSpending);

  return (
    <div className="card bg-base-100 p-6 shadow">
      <h3 className="mb-4 text-lg font-bold">Membership Status</h3>

      <div className="mb-6 flex items-center gap-4">
        <div
          className={`${tierInfo.color} flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white`}
        >
          {tierInfo.name[0]}
        </div>
        <div>
          <p className="text-2xl font-bold">{tierInfo.name}</p>
          <p className="text-sm text-gray-500">Current Tier</p>
        </div>
      </div>

      {nextTierSpending && (
        <>
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold">Progress to Next Tier</span>
              <span className="text-gray-500">
                ${currentSpending} / ${nextTierSpending}
              </span>
            </div>
            <progress className="progress progress-primary w-full" value={progress} max="100" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Spend ${remaining} more to reach the next tier
          </p>
        </>
      )}

      {!nextTierSpending && (
        <p className="text-success text-center text-sm font-semibold">
          🎉 You've reached the highest tier!
        </p>
      )}
    </div>
  );
}
