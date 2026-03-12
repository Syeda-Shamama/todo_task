"use client";
// [Task]: T-021
// [From]: speckit.plan §2.1, speckit.specify §2.2, §2.3

import { useState, useCallback } from "react";
import Link from "next/link";
import { Task, api } from "@/lib/api";
import TaskCard from "./TaskCard";
import FilterBar from "./FilterBar";

interface TaskListProps {
  initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created");
  const [loading, setLoading] = useState(false);

  const handleFilterChange = useCallback(async (newStatus: string, newSort: string) => {
    setStatus(newStatus);
    setSort(newSort);
    setLoading(true);
    try {
      const data = await api.getTasks(newStatus, newSort);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleUpdate(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDelete(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div>
      {/* Stats bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#111827] border border-slate-800 rounded-2xl">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500">Progress</span>
              <span className="text-xs font-medium text-slate-400">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : "0%" }}
              />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-white">{Math.round((completedCount / totalCount) * 100)}%</p>
            <p className="text-xs text-slate-500">complete</p>
          </div>
        </div>
      )}

      {/* Filter + New Task */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <FilterBar status={status} sort={sort} onChange={handleFilterChange} />
        <Link
          href="/tasks/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </Link>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium mb-1">No tasks yet</p>
          <p className="text-sm text-slate-600 mb-5">Get started by creating your first task</p>
          <Link
            href="/tasks/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create your first task
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
