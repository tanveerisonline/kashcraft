import React, { useState } from 'react';
import { Input } from '../../ui/input'; // Assuming Input component exists
import { Button } from '../../ui/button'; // Assuming Button component exists

interface CartCouponProps {
  onApplyCoupon: (couponCode: string) => void;
  className?: string;
}

const CartCoupon: React.FC<CartCouponProps> = ({ onApplyCoupon, className }) => {
  const [couponCode, setCouponCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Have a Coupon?</h2>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">Apply</Button>
      </form>
    </div>
  );
};

export { CartCoupon };
