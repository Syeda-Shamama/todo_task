"use client";
// [Task]: T-018
// [From]: speckit.plan §2.1, speckit.specify §2.3

interface FilterBarProps {
  status: string;
  sort: string;
  onChange: (status: string, sort: string) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Done" },
];

const SORT_OPTIONS = [
  { value: "created", label: "Newest" },
  { value: "title", label: "Title A–Z" },
  { value: "due_date", label: "Due Date" },
];

export default function FilterBar({ status, sort, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status tabs */}
      <div className="flex rounded-xl border border-slate-700 overflow-hidden bg-[#0d1526] p-0.5 gap-0.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value, sort)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition ${
              status === opt.value
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onChange(status, e.target.value)}
          className="appearance-none bg-[#0d1526] border border-slate-700 text-slate-400 text-xs rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
