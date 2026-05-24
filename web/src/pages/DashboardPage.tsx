const cards = [
  {
    title: "Active Projects",
    value: "12",
  },
  {
    title: "Open Tenders",
    value: "7",
  },
  {
    title: "Revenue Forecast",
    value: "£2.4M",
  },
  {
    title: "AI Confidence",
    value: "89%",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {card.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-800">
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm h-[400px]">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Project Activity
        </h2>

        <div className="h-full rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Chart Area
        </div>
      </div>
    </div>
  );
}