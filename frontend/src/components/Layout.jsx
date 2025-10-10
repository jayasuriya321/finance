import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Home, List, Wallet, Repeat, Target } from "lucide-react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition duration-300 ease-in-out bg-white shadow-lg w-64 z-50 lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-blue-600">FinanceApp</h2>
          <button
            className="lg:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <Home size={18} /> Dashboard
          </NavLink>
          <NavLink
            to="/add-expense"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <Wallet size={18} /> Add Expense
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <List size={18} /> Categories
          </NavLink>
          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <Wallet size={18} /> Budgets
          </NavLink>
          <NavLink
            to="/recurring-expenses"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <Repeat size={18} /> Recurring
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <Target size={18} /> Goals
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${
                isActive ? "bg-blue-500 text-white" : "text-gray-700"
              }`
            }
          >
            <User size={18} /> Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 rounded w-full text-left text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-2">
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">My Account</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
