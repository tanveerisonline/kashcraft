import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

interface AdminSidebarProps {
  // Add any props if needed
}

const AdminSidebar: React.FC<AdminSidebarProps> = () => {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white px-3 py-4 shadow-sm">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Admin Dashboard
          </h2>
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              <Package className="mr-2 h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              <Users className="mr-2 h-4 w-4" />
              Customers
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
