// [Task]: T-017
// [From]: speckit.plan §2.1, §6

import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import SignOutButton from "./SignOutButton";

export default async function NavBar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <nav className="bg-[#111827] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-base font-bold text-white tracking-tight">TodoApp</span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-400">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-400 hidden sm:block">{user.name ?? user.email}</span>
          </div>
          <SignOutButton />
        </div>
      )}
    </nav>
  );
}
