import React from "react";
import { LogOut, Mic } from "lucide-react";
import { useApp } from "../context/AppContext";

export function TopBar() {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    dispatch({ type: "SET_LOGOUT" });
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* App Name */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-[#B34EDF]" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Kendo Meeting Assistant
          </h1>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#B34EDF] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {state.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {state.user?.name}
              </p>
              <p className="text-xs text-slate-500">{state.user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-[#B34EDF] hover:bg-purple-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
