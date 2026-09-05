import { redirect } from "next/navigation";
import { getPlatformSession } from "@/lib/platform-auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign in — Gigzman",
  robots: { index: false, follow: false },
};

export default async function PlatformLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getPlatformSession();
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";

  if (session) redirect(next);

  return (
    <div className="flex min-h-screen items-center justify-center bg-tint px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="eyebrow">Gigzman</p>
          <h1 className="display-md mt-2">Sign in</h1>
          <p className="mt-2 text-[13px] text-ink-muted">Team access only.</p>
        </div>

        <div className="mt-7 rounded-[12px] border border-line bg-surface p-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
