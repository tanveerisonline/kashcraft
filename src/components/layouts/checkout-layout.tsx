import React from "react";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  stepper?: React.ReactNode; // Placeholder for a stepper component
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children, stepper }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {stepper && <div className="mb-8">{stepper}</div>}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <main className="md:col-span-2">{children}</main>
        <aside className="md:col-span-1">{/* Order Summary or other checkout info */}</aside>
      </div>
    </div>
  );
};

export { CheckoutLayout };
