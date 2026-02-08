"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, Package, Truck, Home } from "lucide-react";

interface TrackingEvent {
  id: string;
  status: string;
  timestamp: string;
  location?: string;
  description: string;
}

interface TrackingTimelineProps {
  orderId: string;
  trackingNumber?: string;
}

export function TrackingTimeline({ orderId, trackingNumber }: TrackingTimelineProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      setLoading(true);
      try {
        const url = trackingNumber
          ? `/api/v1/tracking/${trackingNumber}`
          : `/api/v1/orders/${orderId}/tracking`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch tracking");

        const data = await res.json();
        setEvents(data.history || data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading tracking");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId, trackingNumber]);

  if (loading)
    return (
      <div className="space-y-4">
        <div className="skeleton h-20" />
      </div>
    );
  if (error) return <div className="alert alert-error">{error}</div>;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle2 className="text-success" size={24} />;
      case "out_for_delivery":
      case "in_transit":
        return <Truck className="text-info" size={24} />;
      case "processing":
        return <Package className="text-warning" size={24} />;
      case "delayed":
        return <AlertCircle className="text-error" size={24} />;
      default:
        return <Clock className="text-gray-400" size={24} />;
    }
  };

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold">Tracking Timeline</h2>
      <div className="space-y-6">
        {events.map((event, idx) => (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              {getStatusIcon(event.status)}
              {idx < events.length - 1 && <div className="mt-2 h-12 w-1 bg-gray-300" />}
            </div>
            <div className="flex-1">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="font-semibold capitalize">{event.status.replace(/_/g, " ")}</h3>
                  {event.location && <p className="text-sm text-gray-500">📍 {event.location}</p>}
                  <p className="text-sm">{event.description}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
