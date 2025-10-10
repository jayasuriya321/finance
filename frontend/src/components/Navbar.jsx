import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, Bars3Icon } from "@heroicons/react/24/outline";

export default function Navbar({ toggleSidebar }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 flex justify-between items-center px-4 py-3 md:px-6">
      {/* Sidebar toggle for mobile */}
      <button
        className="text-gray-600 md:hidden p-2 hover:bg-gray-100 rounded transition"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 hidden md:block">
        Personal Finance Dashboard
      </h1>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition"
          aria-haspopup="true"
          aria-expanded={profileOpen}
        >
          <span className="font-medium text-gray-700">{userName}</span>
          <ChevronDownIcon
            className="w-4 h-4 text-gray-500 transition-transform duration-200"
            style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* Dropdown Menu */}
        <div
          className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 transform transition-all duration-200 origin-top-right
            ${profileOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
            }`}
          role="menu"
        >
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition font-medium"
            role="menuitem"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
