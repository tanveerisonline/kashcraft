import React from "react";
import Link from "next/link";

interface HeaderProps {
  logo?: React.ReactNode;
  search?: React.ReactNode;
  cart?: React.ReactNode;
  userMenu?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ logo, search, cart, userMenu }) => {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {logo ? (
            logo
          ) : (
            <Link href="/" className="text-xl font-bold text-gray-800">
              Kashcraft
            </Link>
          )}
        </div>
        <div className="flex flex-grow items-center justify-center px-4">{search}</div>
        <div className="flex items-center space-x-4">
          {cart}
          {userMenu}
        </div>
      </div>
    </header>
  );
};

export { Header };
