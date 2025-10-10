import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Animate sidebar mount
  useEffect(() => {
    if (isOpen) setMounted(true);
    else {
      const timeout = setTimeout(() => setMounted(false), 300); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Expenses", path: "/expenses" },
    { name: "Budgets", path: "/budgets" },
    { name: "Categories", path: "/categories" },
    { name: "Recurring Expenses", path: "/recurring-expenses" },
    { name: "Goals", path: "/goals" },
    { name: "Profile", path: "/profile" },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Close button for mobile */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-800 p-2 rounded transition"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="mt-6 flex flex-col gap-2 px-4" role="menu">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => isOpen && toggleSidebar()}
              className={`px-3 py-2 rounded hover:bg-gray-100 transition font-medium ${
                location.pathname === link.path ? "bg-gray-200 text-gray-900" : "text-gray-700"
              }`}
              role="menuitem"
              aria-current={location.pathname === link.path ? "page" : undefined}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
