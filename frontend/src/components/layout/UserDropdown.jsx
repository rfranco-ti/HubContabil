import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Shield, LogOut, ChevronDown, User } from "lucide-react";
import { clearAuth, getUser } from "../../utils/auth";

export function UserDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = getUser();

  const userName = user?.nome || "Administrador";
  const userCargo = user?.cargo || "Socio Diretor";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();
  const isAdmin =
    userCargo.toLowerCase() === "admin" ||
    userCargo.toLowerCase() === "administrador";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menu do usuario"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-600/30">
          {userInitial}
        </div>
        <div className="hidden xl:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
            {userName}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[140px]">
            {userCargo}
          </p>
        </div>
        <ChevronDown
          size={16}
          className="text-gray-500 dark:text-slate-400 hidden xl:block"
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/30">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                    {userCargo}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-gray-500 dark:text-slate-500 truncate mt-0.5">
                      {userEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="py-1">
              <Link
                to="/configs"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings
                  size={16}
                  className="text-gray-500 dark:text-slate-500"
                />
                Configuracoes
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Shield
                    size={16}
                    className="text-gray-500 dark:text-slate-500"
                  />
                  Painel Admin
                </Link>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} />
                Sair do Sistema
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
