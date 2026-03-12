// [Task]: T-021
// [From]: speckit.plan §2.1, §6, speckit.specify §2.2, §2.3

import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import TaskList from "@/components/TaskList";

async function fetchTasks(userId: string, token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/${userId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TasksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const token = (session as any).session?.token ?? "";
  const tasks = await fetchTasks(userId, token);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>
      <NavBar />
      <main className="relative max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your work</p>
        </div>
        <TaskList initialTasks={tasks} />
      </main>
    </div>
  );
}
