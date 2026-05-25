import { useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileUp,
  FolderOpen,
  Gauge,
  ListChecks,
  MessageSquareText,
  PoundSterling,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { cn } from "../lib/utils";

type StageId =
  | "pre-tender"
  | "estimating"
  | "submission"
  | "negotiation"
  | "award";

type SemanticTone = "blue" | "green" | "amber" | "red" | "slate";

const stages: Array<{
  id: StageId;
  label: string;
  shortLabel: string;
  status: "complete" | "active" | "locked";
}> = [
  {
    id: "pre-tender",
    label: "Pre-Tender",
    shortLabel: "Pre",
    status: "complete",
  },
  {
    id: "estimating",
    label: "Estimating",
    shortLabel: "Estimate",
    status: "active",
  },
  {
    id: "submission",
    label: "Submission",
    shortLabel: "Submit",
    status: "locked",
  },
  {
    id: "negotiation",
    label: "Negotiation",
    shortLabel: "Negotiate",
    status: "locked",
  },
  {
    id: "award",
    label: "Award",
    shortLabel: "Award",
    status: "locked",
  },
];

const tenderOptions = [
  "Cambridge Civic Quarter",
  "Bristol Hospital Retrofit",
  "Leeds Student Living",
];

const tenderSummary = {
  client: "Cambridge City Council",
  value: "£8.6M",
  bidDue: "12 Jun 2026",
  countdown: "18d 04h",
  confidence: 78,
  margin: "11.8%",
  risk: "Medium",
};

const estimateRows = [
  {
    code: "1.0",
    item: "Site preliminaries",
    supplier: "BuildFlow internal",
    quantity: "16 wks",
    cost: "£428K",
    delta: "+2.1%",
    tone: "amber" as SemanticTone,
  },
  {
    code: "2.0",
    item: "Substructure package",
    supplier: "East Anglia Groundworks",
    quantity: "1 lot",
    cost: "£1.42M",
    delta: "-1.8%",
    tone: "green" as SemanticTone,
  },
  {
    code: "2.1",
    item: "Piling attendance",
    supplier: "Fen Piling Ltd",
    quantity: "112 piles",
    cost: "£386K",
    delta: "+4.6%",
    tone: "red" as SemanticTone,
  },
  {
    code: "3.0",
    item: "Frame and envelope",
    supplier: "Northern Steelworks",
    quantity: "1 lot",
    cost: "£2.31M",
    delta: "+0.4%",
    tone: "blue" as SemanticTone,
  },
];

const submissionFiles = [
  {
    name: "Form of tender",
    owner: "Commercial",
    status: "Verified",
    tone: "green" as SemanticTone,
  },
  {
    name: "Programme narrative",
    owner: "Planning",
    status: "Draft review",
    tone: "amber" as SemanticTone,
  },
  {
    name: "Health and safety method",
    owner: "HSEQ",
    status: "Missing",
    tone: "red" as SemanticTone,
  },
  {
    name: "Social value response",
    owner: "Bid team",
    status: "Ready",
    tone: "green" as SemanticTone,
  },
];

const preTenderCriteria = [
  {
    label: "Client fit",
    score: 82,
    tone: "green" as SemanticTone,
  },
  {
    label: "Resource capacity",
    score: 64,
    tone: "amber" as SemanticTone,
  },
  {
    label: "Contract exposure",
    score: 41,
    tone: "red" as SemanticTone,
  },
];

const negotiationLog = [
  {
    time: "09:20",
    title: "Client requested VE option for facade finish",
    impact: "-£186K",
    tone: "blue" as SemanticTone,
  },
  {
    time: "11:45",
    title: "Legal flagged liquidated damages clause",
    impact: "Blocker",
    tone: "red" as SemanticTone,
  },
  {
    time: "14:10",
    title: "MEP subcontractor held price for 21 days",
    impact: "Clear",
    tone: "green" as SemanticTone,
  },
];

const awardTasks = [
  "Initialize project instance",
  "Map tender BoQ to project cost plan",
  "Create handover pack",
  "Log post-bid criteria",
];

const aiSignals = [
  {
    label: "Clause risk",
    value: "2 critical",
    tone: "red" as SemanticTone,
  },
  {
    label: "Supplier coverage",
    value: "84%",
    tone: "green" as SemanticTone,
  },
  {
    label: "Pricing drift",
    value: "+1.6%",
    tone: "amber" as SemanticTone,
  },
];

function toneClasses(tone: SemanticTone) {
  const classes = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return classes[tone];
}

function progressColor(tone: SemanticTone) {
  const classes = {
    blue: "bg-blue-600",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    slate: "bg-slate-400",
  };

  return classes[tone];
}

function StageContent({ stage }: { stage: StageId }) {
  const [expanded, setExpanded] = useState(false);

  if (stage === "pre-tender") {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {preTenderCriteria.map((criterion) => (
            <div
              key={criterion.label}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">
                  {criterion.label}
                </p>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-semibold",
                    toneClasses(criterion.tone)
                  )}
                >
                  {criterion.score}
                </span>
              </div>

              <div className="mt-5 h-2 rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    progressColor(criterion.tone)
                  )}
                  style={{ width: `${criterion.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-slate-800">
                Pursuit sign-off
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Commercial director approval required before estimating lock.
              </p>
            </div>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Request sign-off
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "submission") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {submissionFiles.map((file) => (
          <div
            key={file.name}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-lg font-semibold text-slate-800">
                  {file.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{file.owner}</p>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-semibold",
                  toneClasses(file.tone)
                )}
              >
                {file.status}
              </span>
            </div>
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700">
              <FileUp size={18} />
              Upload package
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (stage === "negotiation") {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white">
          {negotiationLog.map((entry) => (
            <div
              key={entry.title}
              className="grid gap-4 border-b border-slate-100 p-5 last:border-b-0 md:grid-cols-[72px_1fr_90px]"
            >
              <span className="font-mono text-sm font-semibold text-slate-500">
                {entry.time}
              </span>
              <p className="font-medium text-slate-800">{entry.title}</p>
              <span
                className={cn(
                  "w-fit rounded-full border px-3 py-1 text-sm font-semibold",
                  toneClasses(entry.tone)
                )}
              >
                {entry.impact}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="m-0 text-lg font-semibold text-slate-800">
            Margin movement
          </h2>
          <p className="mt-2 text-4xl font-bold text-emerald-600">+0.7%</p>
          <p className="mt-1 text-sm text-slate-500">
            Current negotiated position
          </p>
        </div>
      </div>
    );
  }

  if (stage === "award") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white">
        {awardTasks.map((task, index) => (
          <div
            key={task}
            className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                {index + 1}
              </span>
              <p className="font-semibold text-slate-800">{task}</p>
            </div>
            <ArrowUpRight className="text-slate-400" size={18} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50 text-sm uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">Code</th>
              <th className="px-5 py-4">BoQ item</th>
              <th className="px-5 py-4">Supplier</th>
              <th className="px-5 py-4">Qty</th>
              <th className="px-5 py-4">Cost</th>
              <th className="px-5 py-4">Delta</th>
            </tr>
          </thead>
          <tbody>
            {estimateRows.map((row) => (
              <tr
                key={row.code}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-mono text-sm text-slate-500">
                  {row.code}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-800">
                  {row.item}
                </td>
                <td className="px-5 py-4 text-slate-600">{row.supplier}</td>
                <td className="px-5 py-4 text-slate-600">{row.quantity}</td>
                <td className="px-5 py-4 font-semibold text-slate-800">
                  {row.cost}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm font-semibold",
                      toneClasses(row.tone)
                    )}
                  >
                    {row.delta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <button
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
        >
          <span className="flex items-center gap-3 font-semibold text-slate-800">
            <SlidersHorizontal size={18} className="text-slate-500" />
            Supplier RFQ overlays
          </span>
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {expanded && (
          <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-3">
            {["Piling", "Steel", "MEP"].map((packageName) => (
              <div
                key={packageName}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-500">
                  {packageName}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">3</p>
                <p className="mt-1 text-sm text-slate-500">returns logged</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TendersPage() {
  const [activeStage, setActiveStage] = useState<StageId>("estimating");
  const [selectedTender, setSelectedTender] = useState(tenderOptions[0]);
  const [search, setSearch] = useState("");

  const activeStageIndex = useMemo(
    () => stages.findIndex((stage) => stage.id === activeStage),
    [activeStage]
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 text-3xl font-bold text-slate-900">
                Tender Management
              </h1>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {selectedTender}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {tenderSummary.client} · {tenderSummary.value} contract value
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative min-w-0 md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tender workspace"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </label>

            <select
              value={selectedTender}
              onChange={(event) => setSelectedTender(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            >
              {tenderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-1">
          <div className="grid min-w-[760px] grid-cols-5 gap-2">
            {stages.map((stage, index) => {
              const isActive = stage.id === activeStage;
              const isComplete =
                stage.status === "complete" || index < activeStageIndex;
              const isLocked =
                stage.status === "locked" && index > activeStageIndex;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={cn(
                    "group relative flex items-center justify-between gap-3 px-4 py-3 text-left transition",
                    "clip-path-chevron",
                    isActive && "bg-blue-600 text-white shadow-sm",
                    isComplete &&
                      !isActive &&
                      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                    isLocked &&
                      !isActive &&
                      "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wide opacity-75">
                      Stage {index + 1}
                    </span>
                    <span className="block truncate font-bold">
                      {stage.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm",
                      isActive && "border-white/40 bg-white/15",
                      isComplete && !isActive && "border-emerald-200 bg-white",
                      isLocked && !isActive && "border-slate-200 bg-white"
                    )}
                  >
                    {isComplete && !isActive ? (
                      <Check size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Production Engine
              </p>
              <h2 className="m-0 mt-1 text-2xl font-bold text-slate-900">
                {stages.find((stage) => stage.id === activeStage)?.label}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "BoQ", icon: ListChecks },
                { label: "RFQ", icon: FolderOpen },
                { label: "Review", icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <StageContent stage={activeStage} />
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Context
              </p>
              <h2 className="m-0 mt-1 text-xl font-bold text-slate-900">
                Bid telemetry
              </h2>
            </div>
            <Gauge className="text-blue-600" size={24} />
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-blue-950">AI win confidence</p>
              <span className="text-3xl font-bold text-blue-700">
                {tenderSummary.confidence}%
              </span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-white">
              <div
                className="h-3 rounded-full bg-blue-600"
                style={{ width: `${tenderSummary.confidence}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <Clock3 size={17} />
                <span className="text-sm font-semibold">Due in</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {tenderSummary.countdown}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <TrendingUp size={17} />
                <span className="text-sm font-semibold">Margin</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {tenderSummary.margin}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {aiSignals.map((signal) => (
              <div
                key={signal.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <span className="font-medium text-slate-700">
                  {signal.label}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-semibold",
                    toneClasses(signal.tone)
                  )}
                >
                  {signal.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-slate-200">
            <div className="border-b border-slate-100 p-4">
              <h2 className="m-0 text-base font-bold text-slate-900">
                Readiness checks
              </h2>
            </div>

            {[
              {
                label: "Commercial review",
                icon: PoundSterling,
                tone: "green" as SemanticTone,
              },
              {
                label: "Draft quality",
                icon: FileCheck2,
                tone: "amber" as SemanticTone,
              },
              {
                label: "Compliance gap",
                icon: ShieldCheck,
                tone: "red" as SemanticTone,
              },
              {
                label: "Client clarification",
                icon: MessageSquareText,
                tone: "blue" as SemanticTone,
              },
            ].map((check) => {
              const Icon = check.icon;

              return (
                <div
                  key={check.label}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-b-0"
                >
                  <span className="flex items-center gap-3 font-medium text-slate-700">
                    <Icon size={18} className="text-slate-500" />
                    {check.label}
                  </span>
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full",
                      progressColor(check.tone)
                    )}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-medium">
                Piling return is above benchmark. Review VE option before
                submission lock.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
