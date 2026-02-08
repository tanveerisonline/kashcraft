import React, { useState } from "react";

export interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface TabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const Tabs: React.FC<TabsProps> = ({ children, defaultValue, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return <div className={`flex border-b border-gray-200 ${className}`}>{children}</div>;
};

const TabTrigger: React.FC<TabTriggerProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabTrigger must be used within a Tabs component");
  }
  const { activeTab, setActiveTab } = context;

  const isActive = activeTab === value;
  const activeStyles = "border-b-2 border-blue-600 text-blue-600";
  const inactiveStyles = "text-gray-500 hover:text-gray-700";

  return (
    <button
      className={`-mb-px px-4 py-2 text-sm font-medium focus:outline-none ${
        isActive ? activeStyles : inactiveStyles
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabContent: React.FC<TabContentProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabContent must be used within a Tabs component");
  }
  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return <div className={`py-4 ${className}`}>{children}</div>;
};

export { Tabs, TabList, TabTrigger, TabContent };
