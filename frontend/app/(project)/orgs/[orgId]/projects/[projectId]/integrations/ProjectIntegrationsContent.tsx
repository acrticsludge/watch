"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { useToast } from "@/app/components/ui/use-toast";
import { Plus, Trash2, AlertCircle, Pencil, ArrowUpCircle, BookOpen } from "lucide-react";

interface Integration {
  id: string;
  service: string;
  account_label: string;
  status: string;
  created_at: string;
  last_synced_at: string | null;
  meta?: unknown;
  sort_order: number;
}

interface ProjectIntegrationsContentProps {
  integrations: Integration[];
  tier: string;
  projectId: string;
}

const WIKI_BASE = "https://github.com/acrticsludge/Stackwatch/wiki";

const SERVICES = [
  {
    id: "github",
    name: "GitHub Actions",
    description: "Track Actions minutes vs monthly limit.",
    caveat:
      "Requires GitHub's legacy billing system. Personal accounts on the new billing platform and most accounts created after 2023 are not supported — the API returns no data.",
    wikiUrl: `${WIKI_BASE}/Connecting-GitHub-Actions`,
    fields: [
      { key: "api_key", label: "Personal Access Token", type: "password", placeholder: "ghp_..." },
      { key: "account_label", label: "Account label", type: "text", placeholder: "e.g. personal" },
    ],
    helpText: "Token needs repo, read:org, and read:user scopes.",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Monitor bandwidth, build minutes, and function invocations.",
    caveat:
      "Hobby plan accounts are not supported — Vercel does not expose billing data via API for Hobby. Pro or Team plan required.",
    wikiUrl: `${WIKI_BASE}/Connecting-Vercel`,
    fields: [
      { key: "api_key", label: "API Token", type: "password", placeholder: "Your Vercel API token" },
      { key: "account_label", label: "Account label", type: "text", placeholder: "e.g. personal" },
    ],
    helpText: "Create a token at vercel.com/account/tokens",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Watch database size, storage, and monthly active users.",
    caveat: null,
    wikiUrl: `${WIKI_BASE}/Connecting-Supabase`,
    fields: [
      { key: "api_key", label: "Management API Key", type: "password", placeholder: "sbp_..." },
      { key: "meta.project_ref", label: "Project ref", type: "text", placeholder: "abcdefghijklmnop" },
      { key: "account_label", label: "Account label", type: "text", placeholder: "e.g. prod-db" },
    ],
    helpText: "Find your Management API key at supabase.com/dashboard/account/tokens",
  },
  {
    id: "railway",
    name: "Railway",
    description: "Monitor memory and CPU usage across all your Railway projects and services.",
    caveat:
      "Usage data requires at least one deployed service. Free tier tracks memory (512 MB/service) and CPU across all projects.",
    wikiUrl: `${WIKI_BASE}/Connecting-Railway`,
    fields: [
      { key: "api_key", label: "API Token", type: "password", placeholder: "Your Railway API token" },
      { key: "account_label", label: "Account label", type: "text", placeholder: "e.g. personal" },
    ],
    helpText: "Create a token at railway.app/account/tokens",
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    description: "Track storage and connection usage across Atlas clusters.",
    caveat:
      "M0/free-tier clusters don't expose live measurements via the Atlas Admin API — values show as 0/limit. Add a connection string (optional) with clusterMonitor access to get real-time data.",
    wikiUrl: `${WIKI_BASE}/Connecting-MongoDB-Atlas`,
    fields: [
      { key: "meta.public_key", label: "Atlas Public Key", type: "text", placeholder: "e.g. abcdefgh" },
      { key: "api_key", label: "Atlas Private Key", type: "password", placeholder: "Your Atlas API private key" },
      { key: "meta.project_id", label: "Project ID", type: "text", placeholder: "e.g. 64a1b2c3d4e5f6a7b8c9d0e1" },
      { key: "meta.connection_string", label: "Connection String (optional)", type: "password", placeholder: "mongodb+srv://user:pass@cluster.mongodb.net/", optional: true },
      { key: "account_label", label: "Account label", type: "text", placeholder: "e.g. prod-cluster" },
    ],
    helpText:
      "Atlas → Identity & Access → Applications → API Keys. Grant Project Read Only access. For the connection string, create a DB user with the clusterMonitor built-in role.",
  },
];

export function ProjectIntegrationsContent({
  integrations,
  tier,
  projectId,
}: ProjectIntegrationsContentProps) {
  const maxPerService = tier === "pro" || tier === "team" ? Infinity : 1;
  const router = useRouter();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  function validateFields(svc: (typeof SERVICES)[0], isEdit: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const field of svc.fields) {
      if (isEdit && field.type === "password") continue;
      if ((field as { optional?: boolean }).optional) continue;
      if (!formData[field.key]?.trim()) {
        errors[field.key] = `${field.label} is required.`;
      }
    }
    return errors;
  }

  function openConnect(serviceId: string) {
    setFormData({});
    setError("");
    setFieldErrors({});
    setOpenDialog(serviceId);
  }

  function openEdit(intg: Integration) {
    const meta =
      intg.meta && typeof intg.meta === "object" && !Array.isArray(intg.meta)
        ? (intg.meta as Record<string, unknown>)
        : null;
    setFormData({
      account_label: intg.account_label,
      ...(meta?.project_ref ? { "meta.project_ref": String(meta.project_ref) } : {}),
      ...(meta?.public_key ? { "meta.public_key": String(meta.public_key) } : {}),
      ...(meta?.project_id ? { "meta.project_id": String(meta.project_id) } : {}),
    });
    setError("");
    setFieldErrors({});
    setEditingIntegration(intg);
  }

  async function handleEdit() {
    if (!editingIntegration) return;
    const svc = SERVICES.find((s) => s.id === editingIntegration.service)!;
    const errors = validateFields(svc, true);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/integrations/${editingIntegration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to update"); return; }
      setEditingIntegration(null);
      toast({ title: "Saved", description: "Integration updated." });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConnect(serviceId: string) {
    const svc = SERVICES.find((s) => s.id === serviceId)!;
    const errors = validateFields(svc, false);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: serviceId, project_id: projectId, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to connect"); return; }
      setOpenDialog(null);
      toast({ title: "Connected!", description: `${serviceId} integration added.` });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePromote(id: string) {
    setPromotingId(id);
    try {
      const res = await fetch(`/api/integrations/${id}/promote`, { method: "POST" });
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to update primary account.", variant: "destructive" });
        return;
      }
      toast({ title: "Primary account updated" });
      router.refresh();
    } finally {
      setPromotingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to remove integration.", variant: "destructive" });
        return;
      }
      toast({ title: "Removed", description: "Integration disconnected." });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {SERVICES.map((svc) => {
        const connected = integrations.filter((i) => i.service === svc.id);
        const atLimit = connected.length >= maxPerService;

        return (
          <div key={svc.id} className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-semibold text-white text-sm">{svc.name}</h2>
                  <a href={svc.wikiUrl} target="_blank" rel="noopener noreferrer" title="How to connect — open wiki" className="text-zinc-600 hover:text-zinc-300 transition-colors">
                    <BookOpen className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="text-sm text-zinc-600">{svc.description}</p>
                {svc.caveat && <p className="text-xs text-amber-500/80 mt-1.5">{svc.caveat}</p>}
              </div>
              <Button
                size="sm"
                variant={atLimit ? "outline" : "default"}
                onClick={() => openConnect(svc.id)}
                disabled={atLimit}
                className={atLimit ? "border-white/10 text-zinc-500 hover:bg-white/[0.04]" : ""}
              >
                <Plus className="h-4 w-4 mr-1" />
                {atLimit ? "Limit reached" : "Add account"}
              </Button>
            </div>

            {atLimit && tier === "free" && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2 mb-4 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Free plan allows 1 account per service. Upgrade to Pro to add multiple accounts.
              </p>
            )}

            {connected.length === 0 ? (
              <p className="text-sm text-zinc-700">No accounts connected.</p>
            ) : (
              <div className="space-y-2">
                {connected.map((intg, idx) => {
                  const isBlocked = tier === "free" && idx > 0;
                  return (
                    <div
                      key={intg.id}
                      className={`flex items-center justify-between border rounded-lg px-4 py-3 transition-opacity ${isBlocked ? "bg-white/1 border-white/4 opacity-60" : "bg-white/3 border-white/6"}`}
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-medium truncate ${isBlocked ? "text-zinc-500" : "text-zinc-200"}`}>{intg.account_label}</p>
                          {idx === 0 && connected.length > 1 && (
                            <span className="shrink-0 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5">Primary</span>
                          )}
                        </div>
                        {isBlocked ? (
                          <p className="text-xs text-amber-500/70">Paused — free plan limit. Make primary to activate, or upgrade to Pro.</p>
                        ) : (
                          <p className="text-xs text-zinc-600">{intg.last_synced_at ? `Last synced ${new Date(intg.last_synced_at).toLocaleString()}` : "Never synced"}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isBlocked ? (
                          <>
                            <Badge variant="warning">paused</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1.5 px-2.5"
                              onClick={() => handlePromote(intg.id)}
                              disabled={promotingId === intg.id}
                            >
                              <ArrowUpCircle className="h-3.5 w-3.5" />
                              {promotingId === intg.id ? "Updating..." : "Make primary"}
                            </Button>
                          </>
                        ) : (
                          <Badge variant={intg.status === "connected" ? "success" : intg.status === "error" ? "danger" : intg.status === "unsupported" ? "warning" : "secondary"}>
                            {intg.status === "unsupported" ? "plan limit" : intg.status}
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-200 hover:bg-white/6" onClick={() => openEdit(intg)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(intg.id)} disabled={deletingId === intg.id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit dialog */}
      {(() => {
        const svc = editingIntegration ? SERVICES.find((s) => s.id === editingIntegration.service) : null;
        return (
          <Dialog open={!!editingIntegration} onOpenChange={(o) => { if (!o) setEditingIntegration(null); }}>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit {svc?.name ?? "Integration"}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                {svc?.fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">{field.label}</Label>
                    <Input
                      type={field.type}
                      placeholder={field.type === "password" ? "Leave blank to keep existing" : field.placeholder}
                      value={formData[field.key] ?? ""}
                      onChange={(e) => { setFormData((p) => ({ ...p, [field.key]: e.target.value })); if (fieldErrors[field.key]) setFieldErrors((p) => { const n = { ...p }; delete n[field.key]; return n; }); }}
                      autoComplete="off"
                      className={fieldErrors[field.key] ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}
                    />
                    {fieldErrors[field.key] && <p className="text-xs text-red-400">{fieldErrors[field.key]}</p>}
                  </div>
                ))}
                {svc?.helpText && <p className="text-xs text-zinc-600">{svc.helpText}</p>}
                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingIntegration(null)} disabled={submitting} className="border-white/10 text-zinc-300 hover:bg-white/6">Cancel</Button>
                <Button onClick={handleEdit} disabled={submitting}>{submitting ? "Saving..." : "Save changes"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {SERVICES.map((svc) => (
        <Dialog key={svc.id} open={openDialog === svc.id} onOpenChange={(o) => !o && setOpenDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Connect {svc.name}
                <a href={svc.wikiUrl} target="_blank" rel="noopener noreferrer" title="Setup guide — open wiki" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <BookOpen className="h-4 w-4" />
                </a>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {svc.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs">{field.label}</Label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key] ?? ""}
                    onChange={(e) => { setFormData((p) => ({ ...p, [field.key]: e.target.value })); if (fieldErrors[field.key]) setFieldErrors((p) => { const n = { ...p }; delete n[field.key]; return n; }); }}
                    autoComplete="off"
                    className={fieldErrors[field.key] ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}
                  />
                  {fieldErrors[field.key] && <p className="text-xs text-red-400">{fieldErrors[field.key]}</p>}
                </div>
              ))}
              {svc.helpText && <p className="text-xs text-zinc-600">{svc.helpText}</p>}
              {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={submitting} className="border-white/10 text-zinc-300 hover:bg-white/[0.06]">Cancel</Button>
              <Button onClick={() => handleConnect(svc.id)} disabled={submitting}>{submitting ? "Connecting..." : "Connect"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
