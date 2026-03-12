// [Task]: T-008
// [From]: speckit.plan §6

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/tasks");
  else redirect("/login");
}
