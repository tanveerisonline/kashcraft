"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const STEPS = ["Shipping", "Payment", "Confirmation"];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardHolder: "",
    expirationDate: "",
    cvv: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [loading, setLoading] = useState(false);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process payment
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingData,
          paymentData,
          shippingMethod,
        }),
      });

      if (res.ok) {
        setStep(3);
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Progress Indicator */}
      <div className="border-b bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            {STEPS.map((stepName, idx) => (
              <div key={idx} className="flex flex-1 items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition ${
                    step > idx + 1
                      ? "bg-green-500 text-white"
                      : step === idx + 1
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-white"
                  }`}
                >
                  {step > idx + 1 ? "✓" : idx + 1}
                </div>
                <span
                  className={`ml-2 font-semibold ${step >= idx + 1 ? "text-primary" : "text-gray-500"}`}
                >
                  {stepName}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mx-4 h-1 flex-1 ${step > idx + 1 ? "bg-green-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="mx-auto max-w-3xl">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <h2 className="mb-6 text-2xl font-bold">Shipping Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.fullName}
                    onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Email *</label>
                  <input
                    type="email"
                    required
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Address *</label>
                <input
                  type="text"
                  required
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.city}
                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">State</label>
                  <input
                    type="text"
                    value={shippingData.state}
                    onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Zip Code</label>
                  <input
                    type="text"
                    value={shippingData.zipCode}
                    onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Country *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.country}
                    onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shipping Method */}
              <div className="border-t pt-6">
                <h3 className="mb-4 font-bold">Shipping Method</h3>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Standard Shipping (5-7 business days)</p>
                      <p className="text-sm text-gray-600">Free on orders over $100</p>
                    </div>
                    <span className="font-bold">FREE</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Express Shipping (2-3 business days)</p>
                      <p className="text-sm text-gray-600">Faster delivery</p>
                    </div>
                    <span className="font-bold">$15.00</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <Link href="/cart">
                  <Button variant="outline">Back to Cart</Button>
                </Link>
                <Button size="lg" type="submit">
                  Continue to Payment
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <h2 className="mb-6 text-2xl font-bold">Payment Information</h2>

              <div>
                <label className="mb-2 block text-sm font-semibold">Card Number *</label>
                <input
                  type="text"
                  placeholder="1234 5678 9123 4567"
                  required
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Card Holder Name *</label>
                <input
                  type="text"
                  required
                  value={paymentData.cardHolder}
                  onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Expiration Date *</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    required
                    value={paymentData.expirationDate}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, expirationDate: e.target.value })
                    }
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">CVV *</label>
                  <input
                    type="text"
                    placeholder="123"
                    required
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  💡 Your payment is secure and encrypted. We never store your full card details.
                </p>
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Shipping
                </Button>
                <Button size="lg" type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">✓</div>
              <h2 className="text-4xl font-bold">Order Confirmed!</h2>
              <p className="text-lg text-gray-600">
                Thank you for your purchase. We've sent a confirmation email to your inbox.
              </p>

              <Card className="mb-6 border-green-200 bg-green-50 p-6">
                <p className="mb-2 text-sm text-gray-600">Order Number</p>
                <p className="text-2xl font-bold text-green-600">ORD-2026-12345</p>
              </Card>

              <p className="text-gray-600">
                You'll receive tracking information via email once your order ships.
              </p>

              <div className="flex justify-center gap-4">
                <Link href="/account/orders">
                  <Button variant="outline">View Orders</Button>
                </Link>
                <Link href="/products">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
