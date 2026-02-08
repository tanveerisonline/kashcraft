import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, sidebar, header }) => {
  return (
    <div className="flex min-h-screen">
      {sidebar && <aside className="w-64 bg-gray-800 text-white">{sidebar}</aside>}
      <div className="flex flex-grow flex-col">
        {header && <header className="border-b bg-white p-4 shadow-sm">{header}</header>}
        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
};

export { DashboardLayout };
