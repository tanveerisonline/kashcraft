import React from "react";
import { Tabs, TabList, TabTrigger, TabContent } from "../../ui/tabs";

interface ProductTabsProps {
  description: string;
  specifications: React.ReactNode;
  reviews: React.ReactNode;
  className?: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  description,
  specifications,
  reviews,
  className,
}) => {
  return (
    <div className={`mt-8 ${className}`}>
      <Tabs defaultValue="description">
        <TabList className="grid w-full grid-cols-3">
          <TabTrigger value="description">Description</TabTrigger>
          <TabTrigger value="specifications">Specifications</TabTrigger>
          <TabTrigger value="reviews">Reviews</TabTrigger>
        </TabList>
        <TabContent value="description" className="mt-4 text-gray-700">
          <p>{description}</p>
        </TabContent>
        <TabContent value="specifications" className="mt-4 text-gray-700">
          {specifications}
        </TabContent>
        <TabContent value="reviews" className="mt-4 text-gray-700">
          {reviews}
        </TabContent>
      </Tabs>
    </div>
  );
};

export { ProductTabs };
