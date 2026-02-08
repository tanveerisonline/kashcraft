"use client";

import React from "react";
import DataTable from "@/components/features/data-table/data-table";
import { ColumnDef } from "@/components/features/data-table/data-table"; // Assuming ColumnDef is exported

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
}

const dummyUsers: User[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "Admin", age: 30 },
  { id: "2", name: "Bob Johnson", email: "bob@example.com", role: "User", age: 24 },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "Editor", age: 35 },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "User", age: 29 },
  { id: "5", name: "Eve Adams", email: "eve@example.com", role: "Admin", age: 42 },
  { id: "6", name: "Frank White", email: "frank@example.com", role: "User", age: 22 },
  { id: "7", name: "Grace Kelly", email: "grace@example.com", role: "Editor", age: 31 },
  { id: "8", name: "Heidi Klum", email: "heidi@example.com", role: "User", age: 27 },
  { id: "9", name: "Ivan Petrov", email: "ivan@example.com", role: "Admin", age: 38 },
  { id: "10", name: "Judy Garland", email: "judy@example.com", role: "User", age: 25 },
  { id: "11", name: "Alice Smith", email: "alice@example.com", role: "Admin", age: 30 },
  { id: "12", name: "Bob Johnson", email: "bob@example.com", role: "User", age: 24 },
  { id: "13", name: "Charlie Brown", email: "charlie@example.com", role: "Editor", age: 35 },
  { id: "14", name: "Diana Prince", email: "diana@example.com", role: "User", age: 29 },
  { id: "15", name: "Eve Adams", email: "eve@example.com", role: "Admin", age: 42 },
  { id: "16", name: "Frank White", email: "frank@example.com", role: "User", age: 22 },
  { id: "17", name: "Grace Kelly", email: "grace@example.com", role: "Editor", age: 31 },
  { id: "18", name: "Heidi Klum", email: "heidi@example.com", role: "User", age: 27 },
  { id: "19", name: "Ivan Petrov", email: "ivan@example.com", role: "Admin", age: 38 },
  { id: "20", name: "Judy Garland", email: "judy@example.com", role: "User", age: 25 },
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (row) => <a href={`mailto:${row.email}`}>{row.email}</a>,
  },
  {
    accessorKey: "role",
    header: "Role",
    enableFiltering: false,
  },
  {
    accessorKey: "age",
    header: "Age",
  },
];

const TestDataTablePage: React.FC = () => {
  const handleRowClick = (user: User) => {
    console.log("Row clicked:", user);
    alert(`You clicked on user: ${user.name}`);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold">Data Table Test Page</h1>
      <DataTable columns={columns} data={dummyUsers} onRowClick={handleRowClick} pageSize={5} />
    </div>
  );
};

export default TestDataTablePage;
