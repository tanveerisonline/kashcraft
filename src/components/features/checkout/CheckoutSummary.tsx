"use client";

interface CheckoutSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
}

export function CheckoutSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
}: CheckoutSummaryProps) {
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-3">
        <h2 className="card-title">Order Summary</h2>

        <div className="divider my-0" />

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {shipping > 0 && (
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="text-success flex justify-between">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="divider my-0" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>

        <button className="btn btn-primary mt-4 w-full">Proceed to Checkout</button>
      </div>
    </div>
  );
}
