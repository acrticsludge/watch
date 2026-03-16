import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-xl font-bold text-white mb-1 tracking-tight">Welcome back</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Sign in to your Stackwatch account
      </p>
      <LoginForm />
    </>
  );
}
