"use client";
// [Task]: T-020
// [From]: speckit.plan §2.1, speckit.specify §2.2

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface TaskFormProps {
  mode: "create" | "edit";
  taskId?: number;
  initialTitle?: string;
  initialDescription?: string;
}

export default function TaskForm({
  mode,
  taskId,
  initialTitle = "",
  initialDescription = "",
}: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 1 || title.length > 200) {
      setError("Title must be between 1 and 200 characters");
      return;
    }
    if (description.length > 1000) {
      setError("Description must be 1000 characters or fewer");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "create") {
        await api.createTask(title.trim(), description || undefined);
      } else if (taskId) {
        await api.updateTask(taskId, { title: title.trim(), description: description || undefined });
      }
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            Title <span className="text-blue-500">*</span>
          </label>
          <span className={`text-xs ${title.length > 180 ? "text-yellow-400" : "text-slate-600"}`}>
            {title.length}/200
          </span>
        </div>
        <input
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-[#0d1526] border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            Description <span className="text-slate-600">(optional)</span>
          </label>
          <span className={`text-xs ${description.length > 900 ? "text-yellow-400" : "text-slate-600"}`}>
            {description.length}/1000
          </span>
        </div>
        <textarea
          maxLength={1000}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          className="w-full bg-[#0d1526] border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none leading-relaxed"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20 text-sm"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : mode === "create" ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
