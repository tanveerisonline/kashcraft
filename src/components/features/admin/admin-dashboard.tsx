"use client";

import AdminSidebar from "./admin-sidebar";
import DashboardCards from "./dashboard-cards";
import SalesChart from "./sales-chart";
import OrdersTable from "./orders-table";
import ProductsTable from "./products-table";
import CustomersTable from "./customers-table";

const AdminDashboard: React.FC = () => {
  // Dummy data for SalesChart
  const salesData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 4500 },
    { name: "May", sales: 6000 },
    { name: "Jun", sales: 5500 },
    { name: "Jul", sales: 7000 },
  ];

  // Dummy data for OrdersTable
  const ordersData = [
    {
      id: "ORD001",
      customerName: "John Doe",
      totalAmount: 120.5,
      status: "Delivered",
      orderDate: "2023-01-15",
    },
    {
      id: "ORD002",
      customerName: "Jane Smith",
      totalAmount: 250.0,
      status: "Processing",
      orderDate: "2023-01-16",
    },
    {
      id: "ORD003",
      customerName: "Peter Jones",
      totalAmount: 75.2,
      status: "Pending",
      orderDate: "2023-01-17",
    },
    {
      id: "ORD004",
      customerName: "Alice Brown",
      totalAmount: 300.0,
      status: "Shipped",
      orderDate: "2023-01-18",
    },
  ];

  // Dummy data for ProductsTable
  const productsData = [
    {
      id: "PROD001",
      name: "Wireless Mouse",
      category: "Electronics",
      price: 25.99,
      stock: 150,
      status: "In Stock",
    },
    {
      id: "PROD002",
      name: "Mechanical Keyboard",
      category: "Electronics",
      price: 79.99,
      stock: 0,
      status: "Out of Stock",
    },
    {
      id: "PROD003",
      name: "USB-C Hub",
      category: "Accessories",
      price: 35.0,
      stock: 200,
      status: "In Stock",
    },
    {
      id: "PROD004",
      name: "Gaming Headset",
      category: "Electronics",
      price: 59.99,
      stock: 75,
      status: "In Stock",
    },
  ];

  // Dummy data for CustomersTable
  const customersData = [
    {
      id: "CUST001",
      name: "John Doe",
      email: "john.doe@example.com",
      totalOrders: 5,
      totalSpent: 550.75,
    },
    {
      id: "CUST002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      totalOrders: 3,
      totalSpent: 320.0,
    },
    {
      id: "CUST003",
      name: "Peter Jones",
      email: "peter.jones@example.com",
      totalOrders: 8,
      totalSpent: 980.5,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <div className="mb-6">
          <DashboardCards />
        </div>
        <div className="mb-6">
          <SalesChart data={salesData} />
        </div>
        <div className="mb-6">
          <OrdersTable orders={ordersData} />
        </div>
        <div className="mb-6">
          <ProductsTable products={productsData} />
        </div>
        <div>
          <CustomersTable customers={customersData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
