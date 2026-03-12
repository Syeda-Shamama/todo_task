// [Task]: T-024
// [From]: speckit.plan §3.2, §5.1

import { getSession } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  const token = (session?.data as any)?.session?.token ?? "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  async getTasks(status = "all", sort = "created") {
    const headers = await getAuthHeaders();
    const userId = await getUserId();
    const res = await fetch(
      `${BASE_URL}/api/${userId}/tasks?status=${status}&sort=${sort}`,
      { headers }
    );
    return handleResponse<Task[]>(res);
  },

  async createTask(title: string, description?: string) {
    const headers = await getAuthHeaders();
    const userId = await getUserId();
    const res = await fetch(`${BASE_URL}/api/${userId}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title, description }),
    });
    return handleResponse<Task>(res);
  },

  async getTask(id: number) {
    const headers = await getAuthHeaders();
    const userId = await getUserId();
    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${id}`, { headers });
    return handleResponse<Task>(res);
  },

  async updateTask(id: number, data: { title?: string; description?: string }) {
    const headers = await getAuthHeaders();
    const userId = await getUserId();
    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: number) {
    const headers = await getAuthHeaders();
    const userId = await getUserId();
    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<void>(res);
  },

  async toggleComplete(id: number) {
    const headers = await getAuthHeaders();
    const userId = await getUserId();
    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${id}/complete`, {
      method: "PATCH",
      headers,
    });
    return handleResponse<Task>(res);
  },
};

async function getUserId(): Promise<string> {
  const session = await getSession();
  const userId = (session?.data?.user as any)?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
