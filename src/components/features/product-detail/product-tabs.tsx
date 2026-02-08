import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs"; // Assuming Tabs components exist

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4 text-gray-700">
          <p>{description}</p>
        </TabsContent>
        <TabsContent value="specifications" className="mt-4 text-gray-700">
          {specifications}
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 text-gray-700">
          {reviews}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { ProductTabs };
