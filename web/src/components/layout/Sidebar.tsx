import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  ClipboardList,  
  BrainCogIcon,
  PoundSterlingIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

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

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <NavLink
  to="/"
  className="flex items-center gap-3 border-b border-slate-800 px-6 py-5"
>
  <img
    src={logo}
    alt="BuildFlow"
    className="h-10 w-10 object-contain"
  />

  <div>
    <h1 className="text-xl font-bold text-white">
      BuildFlow
    </h1>

    <p className="text-xs text-slate-400">
      Construction Intelligence
    </p>
  </div>
</NavLink>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
  key={item.name}
  to={item.path}
  className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-slate-800 transition"
>
  <Icon size={20} />
  <span>{item.name}</span>
</NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
