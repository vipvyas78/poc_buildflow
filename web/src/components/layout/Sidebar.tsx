import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  ClipboardList,
  BrainCogIcon,
  PoundSterlingIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Tenders",
    path: "/tenders",
    icon: FolderKanban,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: Briefcase,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: ClipboardList,
  },
  {
    name: "AI Page",
    path: "/AI",
    icon: BrainCogIcon,
  },
  {
    name: "Costs",
    path: "/costs",
    icon: PoundSterlingIcon,
  },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 text-white transition-[width] duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-slate-800 py-5",
          collapsed ? "justify-center px-3" : "justify-between gap-3 px-6"
        )}
      >
        <NavLink
          to="/"
          className={cn(
            "flex min-w-0 items-center gap-3",
            collapsed && "justify-center"
          )}
          aria-label="BuildFlow dashboard"
        >
          <img src={logo} alt="BuildFlow" className="h-10 w-10 object-contain" />

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="m-0 text-xl font-bold leading-tight text-white">
                BuildFlow
              </h1>

              <p className="text-xs text-slate-400">
                Construction Intelligence
              </p>
            </div>
          )}
        </NavLink>

        {!collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="border-b border-slate-800 px-3 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="mx-auto text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        </div>
      )}

      <nav
        className={cn(
          "flex-1 space-y-2 p-4",
          collapsed && "px-3"
        )}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white",
                  collapsed ? "justify-center px-0" : "px-4",
                  isActive && "bg-slate-800 text-white"
                )
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
              {collapsed && <span className="sr-only">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
