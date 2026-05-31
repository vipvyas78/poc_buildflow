const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

function buildUrl(path: string) {
  return `${API_BASE.replace(/\/$/, "")}${path}`;
}

async function fetchJson(path: string) {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getProjects() {
  return fetchJson("/api/projects");
}

export async function getTasks() {
  return fetchJson("/api/tasks");
}

export async function getTenders() {
  return fetchJson("/api/tenders");
}

export async function getTenderById(id: string) {
  return fetchJson(`/api/tenders/${id}`);
}
