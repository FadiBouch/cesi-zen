import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Icons
import {
  FaHome,
  FaUsers,
  FaFolder,
  FaTags,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 text-white transition-all duration-300 fixed h-full z-20`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div
            className={`${sidebarOpen ? "block" : "hidden"} font-bold text-xl`}
          >
            CESI Zen - Admin
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded bg-orange-700 hover:bg-gray-700"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="mt-4">
          <ul>
            <li>
              <Link
                to="/"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === "/"
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
              >
                <FaHome className="mr-4" />
                <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                  Tableau de bord
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/users"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === "/users"
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
              >
                <FaUsers className="mr-4" />
                <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                  Utilisateurs
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/categories"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === "/categories"
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
              >
                <FaTags className="mr-4" />
                <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                  Catégories
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/contents"
                className={`flex items-center py-3 px-4 ${
                  location.pathname === "/contents"
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
              >
                <FaFolder className="mr-4" />
                <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                  Contenus
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-700">
          <div className="px-4 py-3">
            <div
              className={`${sidebarOpen ? "flex items-center mb-2" : "hidden"}`}
            >
              <FaUser className="mr-2" />
              <span className="text-sm">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full py-2 px-2 text-white hover:bg-gray-700 rounded bg-red-700"
            >
              <FaSignOutAlt className="mr-2" />
              <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                Déconnexion
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === "/" && "Dashboard"}
              {location.pathname === "/users" && "Gestion des Utilisateurs"}
              {location.pathname === "/categories" && "Gestion des Catégories"}
              {location.pathname === "/contents" && "Gestion des Contenus"}
            </h1>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
