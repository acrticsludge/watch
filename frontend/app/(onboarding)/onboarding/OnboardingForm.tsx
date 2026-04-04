"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function OnboardingForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgSlugEdited, setOrgSlugEdited] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [projectSlugEdited, setProjectSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleOrgNameChange(v: string) {
    setOrgName(v);
    if (!orgSlugEdited) setOrgSlug(slugify(v));
  }

  function handleProjectNameChange(v: string) {
    setProjectName(v);
    if (!projectSlugEdited) setProjectSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim() || !orgSlug.trim() || !projectName.trim() || !projectSlug.trim()) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // 1. Create org
      const orgRes = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim(), slug: orgSlug.trim() }),
      });
      const orgData = await orgRes.json();
      if (!orgRes.ok) { setError(orgData.error ?? "Failed to create organization"); return; }

      // 2. Create project
      const projRes = await fetch(`/api/orgs/${orgData.id}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim(), slug: projectSlug.trim() }),
      });
      const projData = await projRes.json();
      if (!projRes.ok) { setError(projData.error ?? "Failed to create project"); return; }

      // 3. Redirect to new project dashboard
      router.push(`/orgs/${orgData.id}/projects/${projData.id}/dashboard`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Organization</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Name</Label>
            <Input
              placeholder="e.g. Acme Corp"
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Slug</Label>
            <Input
              placeholder="e.g. acme-corp"
              value={orgSlug}
              onChange={(e) => { setOrgSlug(e.target.value); setOrgSlugEdited(true); }}
              autoComplete="off"
              required
            />
            <p className="text-xs text-zinc-600">Lowercase letters, numbers, and hyphens (max 40 characters).</p>
          </div>
        </div>
      </div>

      {/* Project */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">First Project</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Name</Label>
            <Input
              placeholder="e.g. Production"
              value={projectName}
              onChange={(e) => handleProjectNameChange(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Slug</Label>
            <Input
              placeholder="e.g. production"
              value={projectSlug}
              onChange={(e) => { setProjectSlug(e.target.value); setProjectSlugEdited(true); }}
              autoComplete="off"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Setting up..." : "Get started"}
      </Button>
    </form>
  );
}
