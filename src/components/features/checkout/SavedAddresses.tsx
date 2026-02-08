"use client";

import { useState, useEffect } from "react";
import { MapPin, Trash2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  type: string;
}

export function SavedAddresses() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/quick-checkout/addresses");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAddresses(data.addresses || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [session]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/quick-checkout/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses(addresses.filter((a) => a.id !== id));
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
        <h2 className="text-2xl font-bold">Saved Addresses</h2>
        <button className="btn btn-primary btn-sm gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add New
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-100 mb-6 p-6 shadow">
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Street Address"
              className="input input-bordered w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="City" className="input input-bordered" />
              <input type="text" placeholder="State" className="input input-bordered" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="ZIP Code" className="input input-bordered" />
              <input type="text" placeholder="Country" className="input input-bordered" />
            </div>
            <select className="select select-bordered w-full">
              <option>Residential</option>
              <option>Business</option>
            </select>
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

      {addresses.length === 0 ? (
        <p className="text-center text-gray-500">No saved addresses</p>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="card bg-base-100 border-primary border-l-4 shadow">
              <div className="card-body flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <MapPin size={32} className="text-primary" />
                  <div>
                    <p className="font-semibold capitalize">{address.type}</p>
                    <p className="text-sm">{address.street}</p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {address.isDefault && <span className="badge badge-success">Default</span>}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(address.id)}>
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
