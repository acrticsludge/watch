"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { useToast } from "@/app/components/ui/use-toast";
import { createClient } from "@/lib/supabase/browser";
import { METRIC_LABELS, SERVICE_LABELS } from "@/lib/utils";

function ManagePortalButton() {
  const [loading, setLoading] = useState(false);
  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/billing/portal");
    setLoading(false);
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.location.href = url;
  }
  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? "Loading..." : "Manage subscription"}
    </button>
  );
}

function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  async function startCheckout() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    setLoading(false);
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.location.href = url;
  }
  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-400 px-4 py-2.5 text-sm font-medium text-white transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Upgrade to Pro — $10/mo"}
    </button>
  );
}

interface AlertConfig {
  id: string;
  integration_id: string;
  metric_name: string;
  threshold_percent: number;
  enabled: boolean;
}

interface AlertChannel {
  id: string;
  type: string;
  config: unknown;
  enabled: boolean;
}

interface Integration {
  id: string;
  service: string;
  account_label: string;
}

interface SettingsContentProps {
  userEmail: string;
  integrations: Integration[];
  alertConfigs: AlertConfig[];
  alertChannels: AlertChannel[];
  tier: string;
}

const DEFAULT_METRICS: Record<string, string[]> = {
  github: ["actions_minutes"],
  vercel: ["bandwidth_gb", "build_minutes", "function_invocations"],
  supabase: ["db_size_mb", "storage_mb", "monthly_active_users"],
  railway: ["memory_usage_mb", "cpu_percent"],
};

const PRO_METRICS: Record<string, string[]> = {
  github: [
    "actions_minutes_ubuntu",
    "actions_minutes_macos",
    "actions_minutes_windows",
    "packages_bandwidth_gb",
    "actions_storage_gb",
  ],
  vercel: [
    "edge_function_execution_ms",
    "image_optimizations",
    "analytics_events",
    "deployments",
  ],
  supabase: [
    "db_connections",
    "cache_hit_ratio",
    "realtime_messages",
    "realtime_peak_connections",
    "func_invocations",
    "db_egress_mb",
  ],
  railway: [
    "cpu_peak_percent",
    "memory_peak_mb",
    "network_tx_mb",
    "network_rx_mb",
    "disk_usage_mb",
  ],
};

export function SettingsContent({
  userEmail,
  integrations,
  alertConfigs,
  alertChannels,
  tier,
}: SettingsContentProps) {
  const isPro = tier === "pro" || tier === "team";
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "alerts";
  const { toast } = useToast();

  const [thresholds, setThresholds] = useState<
    Record<string, { threshold: number; enabled: boolean }>
  >(() => {
    const map: Record<string, { threshold: number; enabled: boolean }> = {};
    for (const cfg of alertConfigs) {
      map[`${cfg.integration_id}::${cfg.metric_name}`] = {
        threshold: cfg.threshold_percent,
        enabled: cfg.enabled,
      };
    }
    return map;
  });

  const emailChannel = alertChannels.find((c) => c.type === "email");
  const [emailEnabled, setEmailEnabled] = useState(
    emailChannel?.enabled ?? false,
  );
  const [emailSaving, setEmailSaving] = useState(false);

  const slackChannel = alertChannels.find((c) => c.type === "slack");
  const [slackUrl, setSlackUrl] = useState(
    (slackChannel?.config as { webhook_url?: string } | null)?.webhook_url ??
      "",
  );
  const [slackEnabled, setSlackEnabled] = useState(
    slackChannel?.enabled ?? false,
  );

  const discordChannel = alertChannels.find((c) => c.type === "discord");
  const [discordUrl, setDiscordUrl] = useState(
    (discordChannel?.config as { webhook_url?: string } | null)?.webhook_url ??
      "",
  );
  const [discordEnabled, setDiscordEnabled] = useState(
    discordChannel?.enabled ?? false,
  );

  const pushChannel = alertChannels.find((c) => c.type === "push");
  const [pushEnabled, setPushEnabled] = useState(pushChannel?.enabled ?? false);
  const [pushSaving, setPushSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const supabase = createClient();

  async function saveThreshold(integrationId: string, metricName: string) {
    const key = `${integrationId}::${metricName}`;
    const val = thresholds[key] ?? { threshold: 80, enabled: true };
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        integration_id: integrationId,
        metric_name: metricName,
        threshold_percent: val.threshold,
        enabled: val.enabled,
      }),
    });
    if (!res.ok) {
      toast({ title: "Failed to save threshold", variant: "destructive" });
    } else {
      toast({ title: "Threshold saved" });
    }
  }

  async function saveEmailChannel() {
    setEmailSaving(true);
    const method = emailChannel ? "PATCH" : "POST";
    const url = emailChannel
      ? `/api/alerts/channels?id=${emailChannel.id}`
      : "/api/alerts/channels";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email",
        config: { email: userEmail },
        enabled: emailEnabled,
      }),
    });
    setEmailSaving(false);
    if (!res.ok) {
      toast({ title: "Failed to save email settings", variant: "destructive" });
    } else {
      toast({ title: "Email notifications updated" });
      router.refresh();
    }
  }

  async function saveWebhookChannel(
    type: "slack" | "discord",
    webhookUrl: string,
    enabled: boolean,
  ) {
    const existing = alertChannels.find((c) => c.type === type);
    const method = existing ? "PATCH" : "POST";
    const url = existing
      ? `/api/alerts/channels?id=${existing.id}`
      : "/api/alerts/channels";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        config: { webhook_url: webhookUrl },
        enabled,
      }),
    });
    if (!res.ok) {
      toast({
        title: `Failed to save ${type} settings`,
        variant: "destructive",
      });
    } else {
      toast({ title: `${type} notifications updated` });
      router.refresh();
    }
  }

  async function savePushChannel(enable: boolean) {
    setPushSaving(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast({ title: "Browser push not supported", variant: "destructive" });
        return;
      }

      let pushSub: PushSubscription | null = null;

      if (enable) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({ title: "Notification permission denied", variant: "destructive" });
          setPushEnabled(false);
          return;
        }

        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        pushSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: pushSub?.toJSON() ?? null, enabled: enable }),
      });

      if (!res.ok) {
        toast({ title: "Failed to save push settings", variant: "destructive" });
        setPushEnabled(!enable);
      } else {
        toast({ title: enable ? "Browser push enabled" : "Browser push disabled" });
        setPushEnabled(enable);
        router.refresh();
      }
    } finally {
      setPushSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({
        title: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      setNewPassword("");
      toast({ title: "Password updated" });
    }
  }

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-6 bg-white/[0.04] border border-white/[0.06]">
        <TabsTrigger
          value="alerts"
          className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-zinc-500"
        >
          Alert Thresholds
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-zinc-500"
        >
          Notifications
        </TabsTrigger>
        <TabsTrigger
          value="account"
          className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-zinc-500"
        >
          Account
        </TabsTrigger>
        <TabsTrigger
          value="billing"
          className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-zinc-500"
        >
          Billing
        </TabsTrigger>
      </TabsList>

      {/* ── Alert Thresholds ── */}
      <TabsContent value="alerts">
        {integrations.length === 0 ? (
          <p className="text-zinc-600 text-sm">
            Connect at least one service first.
          </p>
        ) : (
          <div className="space-y-4">
            {integrations.map((intg) => {
              const metrics = [
                ...(DEFAULT_METRICS[intg.service] ?? []),
                ...(isPro ? (PRO_METRICS[intg.service] ?? []) : []),
              ];
              return (
                <div
                  key={intg.id}
                  className="bg-[#111] border border-white/[0.06] rounded-xl p-6"
                >
                  <h3 className="font-semibold text-white mb-4 text-sm">
                    {SERVICE_LABELS[intg.service]} — {intg.account_label}
                  </h3>
                  <div className="space-y-5">
                    {metrics.map((metric) => {
                      const key = `${intg.id}::${metric}`;
                      const val = thresholds[key] ?? {
                        threshold: 80,
                        enabled: true,
                      };
                      return (
                        <div key={metric} className="flex items-center gap-4">
                          <Switch
                            checked={val.enabled}
                            onCheckedChange={(checked) =>
                              setThresholds((p) => ({
                                ...p,
                                [key]: { ...val, enabled: checked },
                              }))
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <Label className="text-sm text-zinc-400">
                                {METRIC_LABELS[metric] ?? metric}
                              </Label>
                              <span className="text-sm font-medium text-zinc-300">
                                {val.threshold}%
                              </span>
                            </div>
                            <Slider
                              min={10}
                              max={100}
                              step={5}
                              value={[val.threshold]}
                              onValueChange={([v]) =>
                                setThresholds((p) => ({
                                  ...p,
                                  [key]: { ...val, threshold: v },
                                }))
                              }
                              disabled={!val.enabled}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveThreshold(intg.id, metric)}
                            className="border-white/10 text-zinc-300 hover:bg-white/[0.06]"
                          >
                            Save
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* ── Notifications ── */}
      <TabsContent value="notifications">
        <div className="space-y-4">
          {/* Email */}
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white text-sm">Email</h3>
                <p className="text-sm text-zinc-600">{userEmail}</p>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>
            <Button size="sm" onClick={saveEmailChannel} disabled={emailSaving}>
              {emailSaving ? "Saving..." : "Save"}
            </Button>
          </div>

          {/* Slack */}
          <div
            className={`bg-[#111] border rounded-xl p-6 ${!isPro ? "border-white/[0.06] opacity-60" : "border-white/[0.06]"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Slack</h3>
                {!isPro && (
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                    Pro
                  </span>
                )}
              </div>
              <Switch
                checked={slackEnabled}
                onCheckedChange={setSlackEnabled}
                disabled={!isPro}
              />
            </div>
            {!isPro ? (
              <p className="text-sm text-zinc-600">
                Slack notifications are available on the{" "}
                <a
                  href="/pricing"
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Pro plan
                </a>
                .
              </p>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackUrl}
                  onChange={(e) => setSlackUrl(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    saveWebhookChannel("slack", slackUrl, slackEnabled)
                  }
                  className="border-white/10 text-zinc-300 hover:bg-white/[0.06] shrink-0"
                >
                  Save
                </Button>
              </div>
            )}
          </div>

          {/* Browser Push */}
          <div
            className={`bg-[#111] border rounded-xl p-6 ${!isPro ? "border-white/[0.06] opacity-60" : "border-white/[0.06]"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Browser Push</h3>
                {!isPro && (
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                    Pro
                  </span>
                )}
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={(checked) => {
                  if (isPro) savePushChannel(checked);
                }}
                disabled={!isPro || pushSaving}
              />
            </div>
            {!isPro ? (
              <p className="text-sm text-zinc-600">
                Browser push notifications are available on the{" "}
                <a
                  href="/pricing"
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Pro plan
                </a>
                .
              </p>
            ) : (
              <p className="text-sm text-zinc-600">
                {pushEnabled
                  ? "You'll receive push alerts in this browser."
                  : "Toggle on to receive real-time push alerts in this browser."}
              </p>
            )}
          </div>

          {/* Discord */}
          <div
            className={`bg-[#111] border rounded-xl p-6 ${!isPro ? "border-white/[0.06] opacity-60" : "border-white/[0.06]"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Discord</h3>
                {!isPro && (
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                    Pro
                  </span>
                )}
              </div>
              <Switch
                checked={discordEnabled}
                onCheckedChange={setDiscordEnabled}
                disabled={!isPro}
              />
            </div>
            {!isPro ? (
              <p className="text-sm text-zinc-600">
                Discord notifications are available on the{" "}
                <a
                  href="/pricing"
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Pro plan
                </a>
                .
              </p>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    saveWebhookChannel("discord", discordUrl, discordEnabled)
                  }
                  className="border-white/10 text-zinc-300 hover:bg-white/[0.06] shrink-0"
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ── Billing ── */}
      <TabsContent value="billing">
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 max-w-lg">
          <h3 className="font-semibold text-white mb-1 text-sm">Current plan</h3>
          <p className="text-zinc-500 text-sm mb-5 capitalize">{tier}</p>
          {!isPro ? (
            <div>
              <p className="text-zinc-400 text-sm mb-4">
                Upgrade to Pro for multiple accounts, Slack &amp; Discord alerts, 5-minute polling, and 30-day history.
              </p>
              <UpgradeButton />
            </div>
          ) : (
            <ManagePortalButton />
          )}
        </div>
      </TabsContent>

      {/* ── Account ── */}
      <TabsContent value="account">
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 max-w-lg">
          <h3 className="font-semibold text-white mb-4 text-sm">
            Change password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Email</Label>
              <Input value={userEmail} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-zinc-400 text-xs">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={pwSaving}>
              {pwSaving ? "Saving..." : "Update password"}
            </Button>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  );
}
