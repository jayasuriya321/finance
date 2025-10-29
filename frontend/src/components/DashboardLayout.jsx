import { useState, useRef, useEffect } from "react";
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
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountHeight, setAccountHeight] = useState("0px");
  const accountRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: HomeIcon },
    { name: "Add Expense", path: "/add-expense", icon: CreditCardIcon },
    { name: "Budgets", path: "/budgets", icon: ChartBarIcon },
    { name: "Categories", path: "/categories", icon: ClipboardDocumentListIcon },
    { name: "Recurring Expenses", path: "/recurring-expenses", icon: ArrowPathIcon },
    { name: "Goals", path: "/goals", icon: FlagIcon },
    { name: "Income", path: "/incomes", icon: CurrencyDollarIcon },
  ];

  const accountMenu = [
    { name: "Profile", path: "/profile", icon: UserIcon },
    { name: "Settings", path: "/settings", icon: Cog6ToothIcon },
  ];

  // Smooth collapse for account section
  useEffect(() => {
    if (accountRef.current) {
      setAccountHeight(accountOpen ? `${accountRef.current.scrollHeight}px` : "0px");
    }
  }, [accountOpen]);

  const renderNavItem = (item) => (
    <NavLink
      key={item.name}
      to={item.path}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition-all ${
          isActive
            ? "bg-[#f45a5721] text-[#f45a57] font-semibold border-l-4 border-[#f45a57]"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#f45a57]"
        }`
      }
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      <item.icon className="w-6 h-6 mr-3" />
      {item.name}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 dark:text-gray-200 shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 overflow-y-auto`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-[#f45a57] dark:text-[#f87171]">
            Finance Manager
          </h2>
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* User greeting */}
        <div className="px-4 py-4 border-b dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Hello, <span className="font-medium">{user?.name || "User"}</span>
          </p>
        </div>

        {/* Main navigation */}
        <nav className="mt-6 mb-6 px-3 space-y-2" role="menu">
          {menuItems.map(renderNavItem)}
        </nav>

        {/* Collapsible Account Section */}
        <div className="mt-4 mb-6 px-3 space-y-2">
          <button
            onClick={() => setAccountOpen(!accountOpen)}
            className="w-full flex items-center justify-between text-gray-400 dark:text-gray-400 uppercase text-xs mb-4"
          >
            <span>Account</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-300 ${
                accountOpen ? "rotate-180 text-[#f45a57]" : ""
              }`}
            />
          </button>
          <div
            ref={accountRef}
            style={{ maxHeight: accountHeight }}
            className="overflow-hidden transition-all duration-300 ease-in-out space-y-1"
          >
            {accountMenu.map(renderNavItem)}
          </div>
        </div>

        {/* Logout */}
        <div className="w-full px-3 py-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition"
            aria-label="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Topbar */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm px-4 py-3 md:hidden transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle Sidebar"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>
        </header>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto scroll-smooth bg-custom-red dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
