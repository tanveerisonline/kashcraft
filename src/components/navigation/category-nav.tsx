import React from "react";
import Link from "next/link";

interface CategoryNavProps {
  categories: { name: string; href: string }[];
  className?: string;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ categories, className }) => {
  return (
    <nav className={`bg-gray-100 py-3 ${className}`}>
      <div className="container mx-auto">
        <ul className="flex justify-center space-x-8">
          {categories.map((category) => (
            <li key={category.name}>
              <Link href={category.href} className="text-gray-700 hover:text-blue-600">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export { CategoryNav };
