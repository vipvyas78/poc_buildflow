import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* SIDEBAR */}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />

      {/* PAGE CONTENT */}

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
