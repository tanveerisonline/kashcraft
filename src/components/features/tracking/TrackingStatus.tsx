"use client";

import { Package, Truck, Home, AlertCircle } from "lucide-react";

interface TrackingStatusProps {
  status: string;
  lastUpdate?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  processing: { icon: <Package size={32} />, color: "text-info", label: "Processing" },
  shipped: { icon: <Truck size={32} />, color: "text-warning", label: "Shipped" },
  in_transit: { icon: <Truck size={32} />, color: "text-info", label: "In Transit" },
  out_for_delivery: {
    icon: <Truck size={32} />,
    color: "text-secondary",
    label: "Out for Delivery",
  },
  delivered: { icon: <Home size={32} />, color: "text-success", label: "Delivered" },
  delayed: { icon: <AlertCircle size={32} />, color: "text-error", label: "Delayed" },
};

export function TrackingStatus({ status, lastUpdate }: TrackingStatusProps) {
  const config = statusConfig[status] || statusConfig.processing;

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-6 text-center">
        <div className={`mb-4 text-center ${config.color}`}>{config.icon}</div>
        <h3 className="card-title justify-center text-lg">{config.label}</h3>
        {lastUpdate && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
