import {
  createBrowserRouter,
} from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";
import TasksPage from "../pages/TasksPage";
import TendersPage from "../pages/TendersPage";

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
        path: "projects",
        element: <ProjectsPage />,
      },

      {
        path: "tasks",
        element: <TasksPage />,
      },

      {
        path: "tenders",
        element: <TendersPage />,
      },
    ],
  },
]);