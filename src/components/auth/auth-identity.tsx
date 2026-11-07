"use client";

import { createContext, useContext } from "react";

const AuthIdentityContext = createContext<string | null>(null);

export function AuthIdentityProvider({ name, children }: { name: string; children: React.ReactNode }) {
  return <AuthIdentityContext.Provider value={name}>{children}</AuthIdentityContext.Provider>;
}

export function useAuthIdentity() {
  return useContext(AuthIdentityContext);
}
