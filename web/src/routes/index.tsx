import {
  createBrowserRouter,
} from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import DashboardPage from "../pages/DashboardPage";

import TendersPage from "../pages/TendersPage";
import ProjectsPage from "../pages/ProjectsPage";
import TasksPage from "../pages/TasksPage";
import AIPage from "../pages/AIPage";
import CostsPage from "../pages/CostsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "tenders",
        element: <TendersPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "AI",
        element: <AIPage />,
      },
      {
        path: "costs",
        element: <CostsPage />,
      },
    ],
  },
]);
