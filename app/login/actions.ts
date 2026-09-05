"use server";

import { redirect } from "next/navigation";
import { verifyPlatformCredentials, createPlatformSession, destroyPlatformSession } from "@/lib/platform-auth";

export interface LoginState {
  error: string | null;
}

export async function loginPlatformAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  const valid = await verifyPlatformCredentials(email, password);
  if (!valid) {
    return { error: "Incorrect email or password." };
  }

  await createPlatformSession(email);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutPlatformAdmin() {
  await destroyPlatformSession();
  redirect("/login");
}
