// [Task]: T-007
// [From]: speckit.plan §5.1, speckit.specify §2.1

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
