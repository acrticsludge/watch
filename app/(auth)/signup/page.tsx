import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-xl font-bold text-white mb-1 tracking-tight">Create an account</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Start monitoring your dev stack for free
      </p>
      <SignupForm />
    </>
  );
}
