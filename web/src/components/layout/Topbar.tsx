export default function Topbar() {
  return (
    <header className="h-16 bg-black border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">
          Welcome, Admin
        </div>

        <div className="h-10 w-10 rounded-full bg-slate-300" />
      </div>
    </header>
  );
}