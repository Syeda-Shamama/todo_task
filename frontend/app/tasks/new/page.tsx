// [Task]: T-022
// [From]: speckit.plan §6, speckit.specify §2.2

import Link from "next/link";
import NavBar from "@/components/NavBar";
import TaskForm from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>
      <NavBar />
      <main className="relative max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/tasks"
            className="p-2 rounded-xl border border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 transition"
            aria-label="Back"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">New Task</h1>
            <p className="text-sm text-slate-500 mt-0.5">Add something to your list</p>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <TaskForm mode="create" />
        </div>
      </main>
    </div>
  );
}
