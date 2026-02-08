import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        {title && (
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export { AuthLayout };
