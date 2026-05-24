import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  ClipboardList,
  Brain,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Tenders", icon: FolderKanban },
  { name: "Projects", icon: Briefcase },
  { name: "Tasks", icon: ClipboardList },
  { name: "AI Insights", icon: Brain },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-3xl font-bold border-b border-slate-700">
        BuildFlow
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-slate-800 transition"
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}