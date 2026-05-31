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
  Layers3,
  ListChecks,
  MessageSquareText,
  PoundSterling,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  generateBoqFromDrawings,
  type BoqGenerationProgress,
  type GenerateBoqResponse,
} from "../features/tenders/api/generateBoq";
import {
  aiSignals,
  awardTasks,
  drawingUploads,
  estimateRows,
  generatedBoqItems,
  negotiationLog,
  nrmModes,
  preTenderCriteria,
  stages,
  submissionFiles,
  tenderOptions,
  tenderSummary,
  type DrawingUpload,
  type GeneratedBoqItem,
  type NrmMode,
  type SemanticTone,
  type StageId,
} from "../features/tenders/data/tenders";
import { cn } from "../lib/utils";

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

function BoqBuilderModule() {
  const [nrmMode, setNrmMode] = useState<NrmMode>("NRM1 + NRM2");
  const [uploadedDrawings, setUploadedDrawings] =
    useState<DrawingUpload[]>(drawingUploads);
  const [generatedItems, setGeneratedItems] =
    useState<GeneratedBoqItem[]>(generatedBoqItems);
  const [isDraftCurrent, setIsDraftCurrent] = useState(true);
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<BoqGenerationProgress>({
      status: "complete",
      progress: 100,
      message: "BOQ draft ready for estimator review",
    });
  const [generationSummary, setGenerationSummary] =
    useState<GenerateBoqResponse["summary"] | null>({
      drawingCount: drawingUploads.length,
      generatedItemCount: generatedBoqItems.length,
      averageConfidence: 76,
      reviewRequiredCount: 3,
    });
  const [generationJobId, setGenerationJobId] = useState("boq-demo");
  const [generationError, setGenerationError] = useState("");

  const isGenerating =
    generationProgress.status !== "complete" &&
    generationProgress.progress < 100;

  function addDrawings(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextDrawings = Array.from(files).map((file) => ({
      name: file.name,
      discipline: "Unclassified",
      status: "Queued",
      tone: "blue" as SemanticTone,
    }));

    setUploadedDrawings((currentDrawings) => [
      ...nextDrawings,
      ...currentDrawings,
    ]);
    setIsDraftCurrent(false);
    setGenerationSummary(null);
  }

  async function generateBoq() {
    setGenerationError("");
    setIsDraftCurrent(false);

    try {
      const response = await generateBoqFromDrawings(
        {
          tenderId: "cambridge-civic-quarter",
          nrmMode,
          drawings: uploadedDrawings,
        },
        setGenerationProgress
      );

      setGeneratedItems(response.items);
      setGenerationSummary(response.summary);
      setGenerationJobId(response.jobId);
      setIsDraftCurrent(true);
    } catch {
      setGenerationError("BOQ generation failed. Try again or review uploads.");
    }
  }

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            NRM BOQ Builder
          </p>
          <h2 className="m-0 mt-1 text-lg font-semibold text-slate-900">
            Drawings to AI-generated bill items
          </h2>
        </div>

        <button
          onClick={generateBoq}
          disabled={isGenerating || uploadedDrawings.length === 0}
          className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles
            size={16}
            className={cn(isGenerating && "animate-pulse")}
          />
          {isGenerating ? "Generating..." : "Generate BOQ"}
        </button>
      </div>

      <div className="grid min-w-0 gap-5 p-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <button
              onClick={() => setMeasurementOpen((isOpen) => !isOpen)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span>
                <span className="block font-semibold text-slate-800">
                  Measurement basis
                </span>
                <span className="mt-1 block text-xs font-medium text-blue-700">
                  {nrmMode}
                </span>
              </span>
              {measurementOpen ? (
                <ChevronDown size={17} className="text-slate-500" />
              ) : (
                <ChevronRight size={17} className="text-slate-500" />
              )}
            </button>

            {measurementOpen && (
              <div className="mt-3 grid gap-2">
                {nrmModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setNrmMode(mode.id);
                      setIsDraftCurrent(false);
                      setGenerationSummary(null);
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-left transition",
                      nrmMode === mode.id
                        ? "border-blue-300 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                    )}
                  >
                    <span className="block font-semibold">{mode.label}</span>
                    <span className="mt-1 block text-xs">
                      {mode.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-blue-300 bg-blue-50 p-5 text-center text-blue-800 transition hover:bg-blue-100">
            <FileUp size={22} />
            <span className="mt-2 font-semibold">Upload drawings</span>
            <span className="mt-1 text-xs">
              PDF, DWG, IFC or image sheets for AI take-off
            </span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(event) => addDrawings(event.target.files)}
            />
          </label>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-semibold">AI review rule</p>
            <p className="mt-1 text-xs">
              Low-confidence quantities stay marked for estimator validation
              before they can move into the priced BoQ.
            </p>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  AI generation status
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {generationProgress.message}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Job {generationJobId}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    isDraftCurrent ? toneClasses("green") : toneClasses("amber")
                  )}
                >
                  {isDraftCurrent ? "Current draft" : "Regeneration needed"}
                </span>
              </div>
            </div>

            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  isDraftCurrent ? "bg-emerald-500" : "bg-blue-600"
                )}
                style={{ width: `${generationProgress.progress}%` }}
              />
            </div>

            {generationSummary && (
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {[
                  {
                    label: "Drawings",
                    value: generationSummary.drawingCount,
                  },
                  {
                    label: "BOQ items",
                    value: generationSummary.generatedItemCount,
                  },
                  {
                    label: "Avg AI",
                    value: `${generationSummary.averageConfidence}%`,
                  },
                  {
                    label: "Review flags",
                    value: generationSummary.reviewRequiredCount,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {generationError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {generationError}
              </p>
            )}
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            {uploadedDrawings.map((drawing) => (
              <div
                key={`${drawing.name}-${drawing.status}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <FolderOpen className="mt-0.5 text-slate-400" size={17} />
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-semibold",
                      toneClasses(drawing.tone)
                    )}
                  >
                    {drawing.status}
                  </span>
                </div>
                <p className="mt-3 font-semibold text-slate-800">
                  {drawing.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {drawing.discipline}
                </p>
              </div>
            ))}
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <Layers3 size={17} className="text-blue-600" />
                AI BOQ draft
              </span>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  isDraftCurrent
                    ? toneClasses("green")
                    : toneClasses("amber")
                )}
              >
                {isDraftCurrent ? "Generated from " : "Stale draft for "}
                {nrmMode}
              </span>
            </div>

            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">NRM1</th>
                    <th className="px-4 py-3">NRM2</th>
                    <th className="px-4 py-3">Generated BOQ item</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">AI</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedItems.map((item) => (
                    <tr
                      key={`${item.nrm}-${item.item}`}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {item.nrm}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {item.nrm2}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {item.item}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.source}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold",
                            toneClasses(item.tone)
                          )}
                        >
                          {item.confidence}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
      <BoqBuilderModule />

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

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-5">
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

        <aside className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-0">
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
