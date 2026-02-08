import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, header, footer }) => {
  return (
    <div className="flex min-h-screen flex-col">
      {header && <header>{header}</header>}
      <main className="flex-grow">{children}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};

export { MainLayout };
