"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/user/addresses").catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          setAddresses(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses([...addresses, data.data]);
        setFormData({ street: "", city: "", state: "", zipCode: "", country: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">My Addresses</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Address"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 p-6">
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="focus:ring-primary rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="focus:ring-primary rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="focus:ring-primary rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="focus:ring-primary rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                required
              />
              <Button type="submit" className="w-full">
                Add Address
              </Button>
            </form>
          </Card>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {addresses.map((address) => (
              <Card key={address.id} className="p-6">
                <div className="mb-4">
                  {address.isDefault && (
                    <span className="mb-2 inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      Default Address
                    </span>
                  )}
                </div>
                <p className="font-semibold">{address.street}</p>
                <p className="text-gray-600">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="mb-4 text-gray-600">{address.country}</p>
                <Button size="sm" variant="outline" className="w-full">
                  Edit
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="mb-4 text-gray-600">No addresses saved</p>
            <Button onClick={() => setShowForm(true)}>Add Your First Address</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
