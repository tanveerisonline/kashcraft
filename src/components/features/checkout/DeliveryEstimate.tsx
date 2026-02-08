"use client";

import { Truck, Clock } from "lucide-react";

interface DeliveryEstimateProps {
  days: number;
  expedited?: boolean;
}

export function DeliveryEstimate({ days, expedited }: DeliveryEstimateProps) {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);

  return (
    <div className={`card ${expedited ? "bg-warning" : "bg-primary"} text-white shadow`}>
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          {expedited ? <Truck size={24} /> : <Clock size={24} />}
          <div>
            <p className="text-sm opacity-90">
              {expedited ? "Fast Delivery" : "Standard Delivery"}
            </p>
            <p className="text-lg font-bold">{expedited ? "2-3 days" : `${days} business days`}</p>
            <p className="text-xs opacity-75">Arrives by {deliveryDate.toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
