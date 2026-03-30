import { getSession } from "@/lib/queries/user";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="h-7 w-7 rounded-md bg-blue-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                <path
                  d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Stackwatch</span>
          </a>
        </div>
        <div className="bg-[#111] rounded-xl border border-white/[0.08] p-7">
          {children}
        </div>
        <p className="text-center text-xs text-zinc-700 mt-5">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
