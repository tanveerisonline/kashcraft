import React, { useState } from "react";

interface MobileMenuProps {
  children: React.ReactNode;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      <button onClick={toggleMenu} className="text-gray-500 focus:outline-none">
        {/* Hamburger icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12"></path>
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 z-50 w-full bg-white shadow-lg">
          <nav className="flex flex-col p-4">{children}</nav>
        </div>
      )}
    </div>
  );
};

export { MobileMenu };
