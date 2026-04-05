"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useToast } from "@/app/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

export default function NewProjectPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40),
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({
          title: "Failed to create project",
          description: body.error ?? "An error occurred.",
          variant: "destructive",
        });
        return;
      }

      const project = await res.json();
      router.push(`/orgs/${orgId}/projects/${project.id}/dashboard`);
    } catch {
      toast({
        title: "Failed to create project",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Link
        href={`/orgs/${orgId}`}
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to organization
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">New project</h1>
        <p className="text-zinc-500 text-sm mt-1">Create a project to organize your integrations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-zinc-400">Project name</Label>
          <Input
            id="name"
            placeholder="My Project"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={80}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-zinc-400">Slug</Label>
          <Input
            id="slug"
            placeholder="my-project"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40));
            }}
            maxLength={40}
            pattern="^[a-z0-9-]{1,40}$"
            required
          />
          <p className="text-xs text-zinc-600">Lowercase letters, numbers, and hyphens only.</p>
        </div>

        <Button type="submit" disabled={loading || !name.trim() || !slug.trim()} className="w-full">
          {loading ? "Creating..." : "Create project"}
        </Button>
      </form>
    </div>
  );
}
