import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

interface DashboardCardsProps {
  cards: DashboardCardProps[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ cards }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <DashboardCard key={index} {...card} />
      ))}
    </div>
  );
};

export default DashboardCards;
