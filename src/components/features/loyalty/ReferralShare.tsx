"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface ReferralShareProps {
  referralCode?: string;
  onCopy?: () => void;
}

export function ReferralShare({ referralCode = "REF123456", onCopy }: ReferralShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/referral/${referralCode}`;

  return (
    <section className="card from-primary to-secondary text-primary-content bg-gradient-to-r shadow-lg">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Share2 size={24} /> Share & Earn
        </h2>
        <p>Invite friends and get $10 rewards for each successful referral!</p>

        <div className="card bg-opacity-20 my-4 bg-black p-4">
          <p className="text-xs opacity-75">Your Referral Code:</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate font-mono text-lg font-bold">{referralCode}</code>
            <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="card-actions gap-2">
          <button className="btn btn-sm">Share on Facebook</button>
          <button className="btn btn-sm">Share on Twitter</button>
        </div>
      </div>
    </section>
  );
}
