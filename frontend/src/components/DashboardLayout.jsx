import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowPathIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext"; // ✅ import AuthContext

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ get current user and logout function

  const handleLogout = () => {
    logout(); // clear context and localStorage
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: HomeIcon },
    { name: "Add Expense", path: "/add-expense", icon: CreditCardIcon },
    { name: "Budgets", path: "/budgets", icon: ChartBarIcon },
    { name: "Categories", path: "/categories", icon: ClipboardDocumentListIcon },
    { name: "Recurring Expenses", path: "/recurring-expenses", icon: ArrowPathIcon },
    { name: "Goals", path: "/goals", icon: FlagIcon },
    { name: "Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 overflow-y-auto`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#f45a57]">Finance Manager</h2>
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* ✅ Display current user's name */}
        <div className="px-4 py-4 border-b">
          <p className="text-gray-600 text-sm">
            Hello, <span className="font-medium">{user?.name || "User"}</span>
          </p>
        </div>

        <nav className="mt-6 px-3 space-y-2" role="menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#f45a5721] text-[#f45a57] font-semibold border-l-4 border-[#f45a57]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#f45a57]"
                }`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              <item.icon className="w-6 h-6 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full px-3 py-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            aria-label="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 ">
        {/* Topbar for Mobile */}
        <header className="flex items-center justify-between bg-white shadow-sm px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Toggle Sidebar"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        </header>

        {/* Overlay when sidebar open on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-6 overflow-y-auto scroll-smooth bg-custom-red">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
