"use client";

import { useState, useEffect } from "react";
import { CreditCard, Trash2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

interface PaymentMethod {
  id: string;
  type: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
}

export function SavedPaymentMethods() {
  const { data: session } = useSession();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchMethods = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/quick-checkout/payment-methods");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMethods(data.methods || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [session]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/quick-checkout/payment-methods?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMethods(methods.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  if (!session?.user?.id) return <p className="text-center">Please log in</p>;
  if (loading) return <div className="skeleton h-40" />;

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Payment Methods</h2>
        <button className="btn btn-primary btn-sm gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add New
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-100 mb-6 p-6 shadow">
          <form className="space-y-4">
            <input type="text" placeholder="Name on Card" className="input input-bordered w-full" />
            <input type="text" placeholder="Card Number" className="input input-bordered w-full" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="MM/YY" className="input input-bordered" />
              <input type="text" placeholder="CVC" className="input input-bordered" />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1">Save</button>
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {methods.length === 0 ? (
        <p className="text-center text-gray-500">No saved payment methods</p>
      ) : (
        <div className="grid gap-4">
          {methods.map((method) => (
            <div key={method.id} className="card bg-base-100 border-primary border-l-4 shadow">
              <div className="card-body flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <CreditCard size={32} className="text-primary" />
                  <div>
                    <p className="font-semibold">{method.cardholderName}</p>
                    <p className="text-sm text-gray-500">
                      {method.type} •••• {method.lastFourDigits}
                    </p>
                    <p className="text-xs text-gray-400">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && <span className="badge badge-success">Default</span>}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(method.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
