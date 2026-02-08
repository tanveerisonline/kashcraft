import React from "react";

interface ProductListProps {
  children: React.ReactNode;
  className?: string;
}

const ProductList: React.FC<ProductListProps> = ({ children, className }) => {
  return <div className={`divide-y divide-gray-200 ${className}`}>{children}</div>;
};

export { ProductList };
