import { useMemo, useState } from "react";

import {
  Filter,
  LayoutGrid,
  List,
  Map,
  RotateCcw,
  Search,
} from "lucide-react";

import { projects } from "../features/projects/data/projects";

const allOption = "All";

const progressRanges = [
  allOption,
  "0-25%",
  "26-50%",
  "51-75%",
  "76-100%",
];

function getUniqueOptions(values: string[]) {
  return [allOption, ...Array.from(new Set(values))];
}

function matchesProgressRange(progress: number, range: string) {
  if (range === allOption) {
    return true;
  }

  const [min, max] = range
    .replace("%", "")
    .split("-")
    .map(Number);

  return progress >= min && progress <= max;
}

function parseCurrency(value: string) {
  const amount = Number(value.replace(/[£MK+,]/g, ""));

  return value.includes("M") ? amount * 1_000_000 : amount * 1_000;
}

function parseVariance(value: string) {
  return Number(value.replace(/[£K+,]/g, "")) * 1_000;
}

function formatCompactPounds(value: number) {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}M`;
  }

  return `£${Math.round(value / 1_000)}K`;
}

function statusClasses(status: string) {
  if (status === "On Track") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Delayed") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function ProjectsPage() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(allOption);
  const [typeFilter, setTypeFilter] = useState(allOption);
  const [budgetFilter, setBudgetFilter] = useState(allOption);
  const [phaseFilter, setPhaseFilter] = useState(allOption);
  const [locationFilter, setLocationFilter] = useState(allOption);
  const [teamFilter, setTeamFilter] = useState(allOption);
  const [deadlineFilter, setDeadlineFilter] = useState(allOption);
  const [progressFilter, setProgressFilter] = useState(allOption);

  const statusOptions = useMemo(
    () => getUniqueOptions(projects.map((project) => project.status)),
    []
  );
  const typeOptions = useMemo(
    () => getUniqueOptions(projects.map((project) => project.type)),
    []
  );
  const budgetOptions = useMemo(
    () => getUniqueOptions(projects.map((project) => project.budgetStatus)),
    []
  );
  const phaseOptions = useMemo(
    () => getUniqueOptions(projects.map((project) => project.phase)),
    []
  );
  const locationOptions = useMemo(
    () => getUniqueOptions(projects.map((project) => project.location)),
    []
  );
  const deadlineOptions = useMemo(
    () => getUniqueOptions(projects.map((project) => project.deadline)),
    []
  );
  const teamOptions = useMemo(
    () => getUniqueOptions(projects.flatMap((project) => project.team)),
    []
  );

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          project.name,
          project.code,
          project.type,
          project.status,
          project.location,
          project.phase,
          project.budgetStatus,
          project.deadline,
          ...project.team,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesSearch &&
        (statusFilter === allOption || project.status === statusFilter) &&
        (typeFilter === allOption || project.type === typeFilter) &&
        (budgetFilter === allOption ||
          project.budgetStatus === budgetFilter) &&
        (phaseFilter === allOption || project.phase === phaseFilter) &&
        (locationFilter === allOption ||
          project.location === locationFilter) &&
        (teamFilter === allOption || project.team.includes(teamFilter)) &&
        (deadlineFilter === allOption ||
          project.deadline === deadlineFilter) &&
        matchesProgressRange(project.progress, progressFilter)
      );
    });
  }, [
    budgetFilter,
    deadlineFilter,
    locationFilter,
    phaseFilter,
    progressFilter,
    search,
    statusFilter,
    teamFilter,
    typeFilter,
  ]);

  const hasActiveFilters =
    search ||
    statusFilter !== allOption ||
    typeFilter !== allOption ||
    budgetFilter !== allOption ||
    phaseFilter !== allOption ||
    locationFilter !== allOption ||
    teamFilter !== allOption ||
    deadlineFilter !== allOption ||
    progressFilter !== allOption;

  const totalValue = filteredProjects.reduce(
    (total, project) => total + parseCurrency(project.value),
    0
  );
  const totalVariance = filteredProjects.reduce(
    (total, project) => total + parseVariance(project.budgetVariance),
    0
  );
  const onTrackCount = filteredProjects.filter(
    (project) => project.status === "On Track"
  ).length;
  const atRiskCount = filteredProjects.filter(
    (project) => project.status === "At Risk"
  ).length;
  const delayedCount = filteredProjects.filter(
    (project) => project.status === "Delayed"
  ).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter(allOption);
    setTypeFilter(allOption);
    setBudgetFilter(allOption);
    setPhaseFilter(allOption);
    setLocationFilter(allOption);
    setTeamFilter(allOption);
    setDeadlineFilter(allOption);
    setProgressFilter(allOption);
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="rounded-3xl bg-white p-6 shadow-sm">

        {/* TOP BAR */}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">
              Projects
            </h1>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
              {filteredProjects.length}
            </div>
          </div>

          {/* VIEW TOGGLE */}

          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">

            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 transition ${
                view === "grid"
                  ? "bg-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <LayoutGrid size={18} />
              Grid
            </button>

            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 transition ${
                view === "list"
                  ? "bg-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <List size={18} />
              List
            </button>

            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 transition ${
                view === "map"
                  ? "bg-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Map size={18} />
              Map
            </button>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mt-6 max-w-md relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 outline-none focus:border-blue-400"
          />
        </div>

        {/* FILTERS */}

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Status",
              value: statusFilter,
              options: statusOptions,
              onChange: setStatusFilter,
            },
            {
              label: "Type",
              value: typeFilter,
              options: typeOptions,
              onChange: setTypeFilter,
            },
            {
              label: "Budget",
              value: budgetFilter,
              options: budgetOptions,
              onChange: setBudgetFilter,
            },
            {
              label: "Progress",
              value: progressFilter,
              options: progressRanges,
              onChange: setProgressFilter,
            },
            {
              label: "Phase",
              value: phaseFilter,
              options: phaseOptions,
              onChange: setPhaseFilter,
            },
            {
              label: "Location",
              value: locationFilter,
              options: locationOptions,
              onChange: setLocationFilter,
            },
            {
              label: "Team",
              value: teamFilter,
              options: teamOptions,
              onChange: setTeamFilter,
            },
            {
              label: "Deadline",
              value: deadlineFilter,
              options: deadlineOptions,
              onChange: setDeadlineFilter,
            },
          ].map((filter) => (
            <label
              key={filter.label}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <Filter className="text-slate-400" size={16} />

              <span className="min-w-16 text-sm font-medium text-slate-500">
                {filter.label}
              </span>

              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="min-w-0 flex-1 bg-transparent font-medium text-slate-700 outline-none"
              >
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            Showing {filteredProjects.length} of {projects.length} projects
          </span>

          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">

        {[
          {
            title: "ACTIVE",
            value: String(filteredProjects.length),
            subtitle: "Matching filters",
          },

          {
            title: "CONTRACT VALUE",
            value: formatCompactPounds(totalValue),
            subtitle: "Total on hand",
          },

          {
            title: "ON TRACK",
            value: String(onTrackCount),
            subtitle: `${filteredProjects.length ? Math.round((onTrackCount / filteredProjects.length) * 100) : 0}% of results`,
          },

          {
            title: "AT RISK / DELAYED",
            value: `${atRiskCount} / ${delayedCount}`,
            subtitle: "Need attention",
          },

          {
            title: "BUDGET VARIANCE",
            value: `+${formatCompactPounds(totalVariance)}`,
            subtitle: `Across ${filteredProjects.length} projects`,
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold tracking-wide text-slate-500">
              {card.title}
            </p>

            <h2 className="mt-4 text-4xl font-bold text-slate-800">
              {card.value}
            </h2>

            <p className="mt-2 text-slate-500">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* GRID VIEW */}

      {view === "grid" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <div className="p-8">

                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="text-3xl font-semibold text-slate-800">
                      {project.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-3 text-slate-500">
                      <span>{project.code}</span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm">
                        {project.type}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 ${statusClasses(project.status)}`}
                  >
                    {project.status}
                  </div>
                </div>

                {/* PROGRESS */}

                <div className="mt-8">

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-lg font-medium">
                      {project.phase}
                    </span>

                    <span className="font-semibold">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-amber-500"
                      style={{
                        width: `${project.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* METRICS */}

                <div className="mt-8 grid grid-cols-2 gap-6">

                  <div>
                    <p className="text-sm text-slate-500">
                      CONTRACT VALUE
                    </p>

                    <p className="mt-1 text-3xl font-semibold">
                      {project.value}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      BUDGET VAR.
                    </p>

                    <p className="mt-1 text-3xl font-semibold">
                      {project.budgetVariance}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      DEADLINE
                    </p>

                    <p className="mt-1 text-2xl font-medium">
                      {project.deadline}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      BUDGET STATUS
                    </p>

                    <p className="mt-1 text-2xl font-medium text-green-700">
                      {project.budgetStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5">

                <div className="text-slate-500">
                  {project.location}
                </div>

                <div className="flex -space-x-2">

                  {project.team.map((member) => (
                    <div
                      key={member}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-sm font-medium text-blue-700"
                    >
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}

      {view === "list" && (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-slate-100 text-left">
              <tr className="text-slate-500">
                <th className="px-6 py-5">PROJECT</th>
                <th>STATUS</th>
                <th>PROGRESS</th>
                <th>VALUE</th>
                <th>DEADLINE</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-100"
                >
                  <td className="px-6 py-6">
                    <div className="font-semibold">
                      {project.name}
                    </div>

                    <div className="text-sm text-slate-500">
                      {project.code}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-2 text-sm font-medium ${statusClasses(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td>{project.progress}%</td>

                  <td>{project.value}</td>

                  <td>{project.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MAP VIEW */}

      {view === "map" && (
        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex h-[500px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">

            <div className="text-center">
              <Map
                className="mx-auto mb-4 text-slate-400"
                size={48}
              />

              <h2 className="text-2xl font-semibold text-slate-700">
                Interactive Project Map
              </h2>

              <p className="mt-2 text-slate-500">
                {filteredProjects.length} filtered projects ready to plot
              </p>
            </div>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-700">
            No projects match these filters
          </h2>

          <button
            onClick={clearFilters}
            className="mt-4 rounded-full bg-blue-100 px-5 py-2 font-medium text-blue-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
