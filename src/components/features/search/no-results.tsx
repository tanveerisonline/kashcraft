import React from "react";

interface NoResultsProps {
  message?: string;
}

const NoResults: React.FC<NoResultsProps> = ({
  message = "Sorry, no results found for your search.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm mt-2">Please try adjusting your search terms or filters.</p>
    </div>
  );
};

export default NoResults;
