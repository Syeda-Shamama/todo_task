"use client";
// [Task]: T-019
// [From]: speckit.plan §2.1, speckit.specify §2.2

import Link from "next/link";
import { api, Task } from "@/lib/api";

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  async function handleToggle() {
    const updated = await api.toggleComplete(task.id);
    onUpdate(updated);
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    await api.deleteTask(task.id);
    onDelete(task.id);
  }

  return (
    <div
      className={`group bg-[#111827] border rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 hover:border-slate-600 ${
        task.completed ? "border-slate-800 opacity-60" : "border-slate-700"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? "bg-blue-600 border-blue-600 shadow-sm shadow-blue-600/40"
            : "border-slate-600 hover:border-blue-500"
        }`}
        aria-label="Toggle completion"
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/tasks/${task.id}`}>
          <h3
            className={`text-sm font-medium transition truncate ${
              task.completed
                ? "line-through text-slate-500"
                : "text-slate-100 hover:text-blue-400"
            }`}
          >
            {task.title}
          </h3>
        </Link>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-slate-600">
            {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {task.completed && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/tasks/${task.id}`}
          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition"
          aria-label="Edit task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </Link>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"
          aria-label="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
