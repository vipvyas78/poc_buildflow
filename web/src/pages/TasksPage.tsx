import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  Search,
} from "lucide-react";

import { getTasks } from "../lib/api";

type Task = {
  id: number;
  title: string;
  project: string;
  contractor: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
  completed: boolean;
};

export default function TasksPage() {

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {

      const matchesProject =
        projectFilter === "All" ||
        task.project === projectFilter;

      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.contractor.toLowerCase().includes(search.toLowerCase());

      return matchesProject && matchesSearch;
    });
  }, [search, projectFilter, tasks]);

  const upcomingTasks = filteredTasks.filter(
    (task) => !task.completed
  );

  const completedTasks = filteredTasks.filter(
    (task) => task.completed
  );

  const uniqueProjects = [
    "All",
    ...new Set(tasks.map((task) => task.project)),
  ];

  if (loading) {
    return (
      <div className="p-6 text-slate-700">Loading tasks...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-700">Error loading tasks: {error}</div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="rounded-3xl bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Tasks
            </h1>

            <p className="mt-2 text-slate-500">
              Track active and completed project work
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or contractors..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* FILTERS */}

        <div className="mt-6 flex flex-wrap gap-3">

          {uniqueProjects.map((project) => (
            <button
              key={project}
              onClick={() => setProjectFilter(project)}
              className={`rounded-full px-5 py-2 transition ${
                projectFilter === project
                  ? "bg-blue-100 text-blue-700"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {project}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock3 className="text-amber-500" />
            <span className="font-medium text-slate-600">
              Upcoming Tasks
            </span>
          </div>

          <h2 className="mt-5 text-5xl font-bold text-slate-800">
            {upcomingTasks.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" />
            <span className="font-medium text-slate-600">
              Completed Tasks
            </span>
          </div>

          <h2 className="mt-5 text-5xl font-bold text-slate-800">
            {completedTasks.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CircleDashed className="text-blue-600" />
            <span className="font-medium text-slate-600">
              Active Projects
            </span>
          </div>

          <h2 className="mt-5 text-5xl font-bold text-slate-800">
            {uniqueProjects.length - 1}
          </h2>
        </div>
      </div>

      {/* UPCOMING TASKS */}

      <div className="rounded-3xl bg-white shadow-sm">

        <div className="border-b border-slate-100 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Upcoming Tasks
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b border-slate-100 text-left">
              <tr className="text-sm uppercase tracking-wide text-slate-500">
                <th className="px-8 py-5">Task</th>
                <th>Project</th>
                <th>Contractor</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>

              {upcomingTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-8 py-6">
                    <div className="font-semibold text-slate-800">
                      {task.title}
                    </div>
                  </td>

                  <td className="text-slate-600">
                    {task.project}
                  </td>

                  <td className="text-slate-600">
                    {task.contractor}
                  </td>

                  <td>
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {task.assignee
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>

                      <span>{task.assignee}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : task.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`font-medium ${
                        task.priority === "High"
                          ? "text-red-600"
                          : task.priority === "Medium"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="font-medium text-slate-700">
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLETED TASKS */}

      <div className="rounded-3xl bg-white shadow-sm">

        <div className="border-b border-slate-100 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Completed Tasks
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b border-slate-100 text-left">
              <tr className="text-sm uppercase tracking-wide text-slate-500">
                <th className="px-8 py-5">Task</th>
                <th>Project</th>
                <th>Contractor</th>
                <th>Assignee</th>
                <th>Completed</th>
              </tr>
            </thead>

            <tbody>

              {completedTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-8 py-6 font-semibold text-slate-800">
                    {task.title}
                  </td>

                  <td>{task.project}</td>

                  <td>{task.contractor}</td>

                  <td>{task.assignee}</td>

                  <td>
                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}