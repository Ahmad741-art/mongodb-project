import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

// Employee components
import EmployeeTable from "./components/employees/EmployeeTable";
import CreateEmployee from "./components/employees/CreateEmployee";
import EditEmployee from "./components/employees/EditEmployee";

// Article components
import ArticleTable from "./components/articles/ArticleTable";
import CreateArticle from "./components/articles/CreateArticle";
import EditArticle from "./components/articles/EditArticle";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <EmployeeTable /> },
      { path: "/employees", element: <EmployeeTable /> },
      { path: "/create-employee", element: <CreateEmployee /> },
      { path: "/edit-employee/:id", element: <EditEmployee /> },
      { path: "/articles", element: <ArticleTable /> },
      { path: "/create-article", element: <CreateArticle /> },
      { path: "/edit-article/:id", element: <EditArticle /> },
      { path: "*", element: <h2>Page Not Found</h2> },
    ],
  },
]);

// Create QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
