"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const { toast } = useToast();
  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Failed to open billing portal", description: body.error ?? undefined, variant: "destructive" });
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast({ title: "Failed to open billing portal", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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

function CancelSubscriptionButton({
  onCancelled,
  isTrialing = false,
}: {
  onCancelled: () => void;
  isTrialing?: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleCancel() {
    setLoading(true);
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast({
        title: isTrialing ? "Failed to cancel trial" : "Failed to cancel subscription",
        description: body.error ?? undefined,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: isTrialing ? "Trial cancelled" : "Subscription cancelled",
      description: isTrialing
        ? "Your trial has been cancelled. No charge was made."
        : "You'll keep Pro access until the end of your billing period.",
    });
    setConfirm(false);
    onCancelled();
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-sm text-zinc-600 hover:text-red-400 transition-colors underline underline-offset-2"
      >
        {isTrialing ? "Cancel trial" : "Cancel subscription"}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm text-zinc-300 mb-1 font-medium">
        {isTrialing ? "Cancel your free trial?" : "Cancel your Pro subscription?"}
      </p>
      <p className="text-xs text-zinc-500 mb-4">
        {isTrialing
          ? "You'll be moved to the Free plan immediately. No charge will be made."
          : "Your subscription won't renew. You'll keep Pro access until the end of your current billing period."}
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-red-500/80 hover:bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Cancelling..." : isTrialing ? "Yes, cancel trial" : "Yes, cancel"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-white/6 hover:bg-white/10 px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isTrialing ? "Keep trial" : "Keep plan"}
        </button>
      </div>
    </div>
  );
}

function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Failed to start checkout", description: body.error ?? undefined, variant: "destructive" });
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast({ title: "Failed to start checkout", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-400 px-4 py-2.5 text-sm font-medium text-white transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Start free 14-day trial"}
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
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  nextBillingAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  defaultTab?: string;
  snapshotMetrics?: Record<string, string[]>;
}

const DEFAULT_METRICS: Record<string, string[]> = {
  github: ["actions_minutes"],
  vercel: ["bandwidth_gb", "build_minutes", "function_invocations"],
  supabase: ["db_size_mb", "storage_mb", "monthly_active_users"],
  railway: ["memory_usage_mb", "cpu_percent"],
  mongodb: ["storage_mb", "connections"],
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
  mongodb: [
    "network_bytes_in_mb",
    "network_bytes_out_mb",
    "cpu_percent",
    "memory_resident_mb",
    "avg_read_latency_ms",
    "avg_write_latency_ms",
    "disk_iops_read",
    "disk_iops_write",
    "replication_lag_s",
    "slow_queries_count",
  ],
};

function MfaSection() {
  const supabase = createClient();
  const { toast } = useToast();
  const [verifiedFactors, setVerifiedFactors] = useState<Array<{ id: string }>>([]);
  const [facLoading, setFacLoading] = useState(true);
  const [enrollData, setEnrollData] = useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaSaving, setMfaSaving] = useState(false);

  useEffect(() => {
    void loadFactors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFactors() {
    setFacLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setVerifiedFactors(
      (data?.totp ?? []).filter((f) => f.status === "verified"),
    );
    setFacLoading(false);
  }

  async function handleEnroll() {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    if (error || !data) {
      toast({ title: "Failed to start 2FA setup", variant: "destructive" });
      return;
    }
    setEnrollData({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setMfaCode("");
    setMfaError("");
  }

  async function handleVerify() {
    if (!enrollData || mfaCode.length !== 6) return;
    setMfaSaving(true);
    setMfaError("");
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge(
      { factorId: enrollData.factorId },
    );
    if (cErr || !challenge) {
      setMfaSaving(false);
      setMfaError("Failed to start challenge. Try again.");
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enrollData.factorId,
      challengeId: challenge.id,
      code: mfaCode,
    });
    setMfaSaving(false);
    if (vErr) {
      setMfaError("Invalid code. Check your authenticator app and try again.");
      return;
    }
    setEnrollData(null);
    setMfaCode("");
    toast({
      title: "2FA enabled",
      description: "Your account is now protected with TOTP authentication.",
    });
    void loadFactors();
  }

  async function handleUnenroll(factorId: string) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast({ title: "Failed to remove 2FA", variant: "destructive" });
      return;
    }
    toast({ title: "2FA removed", description: "Two-factor authentication has been disabled." });
    void loadFactors();
  }

  if (facLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <p className="text-xs text-zinc-600">Loading…</p>
      </div>
    );
  }

  if (verifiedFactors.length > 0) {
    return (
      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <h3 className="font-semibold text-white mb-1 text-sm">
          Two-factor authentication
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Enabled
          </span>
        </div>
        <p className="text-zinc-500 text-xs mb-4">
          Your account is protected with an authenticator app.
        </p>
        <button
          onClick={() => handleUnenroll(verifiedFactors[0].id)}
          className="text-sm text-zinc-600 hover:text-red-400 transition-colors underline underline-offset-2"
        >
          Remove 2FA
        </button>
      </div>
    );
  }

  if (enrollData) {
    return (
      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <h3 className="font-semibold text-white mb-1 text-sm">
          Set up two-factor authentication
        </h3>
        <p className="text-zinc-500 text-xs mb-4">
          Scan this QR code with an authenticator app (e.g. Google
          Authenticator, Authy), then enter the 6-digit code to confirm.
        </p>
        <div className="mb-4 w-36 h-36 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={`data:image/svg+xml,${encodeURIComponent(enrollData.qrCode)}`}
            alt="QR code for 2FA setup"
            className="w-full h-full"
          />
        </div>
        <p className="text-zinc-600 text-xs mb-4">
          Can&apos;t scan? Enter this secret manually:{" "}
          <span className="font-mono text-zinc-400">{enrollData.secret}</span>
        </p>
        <div className="flex gap-2 items-center mb-1">
          <Input
            placeholder="6-digit code"
            value={mfaCode}
            onChange={(e) => {
              setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (mfaError) setMfaError("");
            }}
            maxLength={6}
            className="w-36 font-mono"
          />
          <Button
            size="sm"
            onClick={handleVerify}
            disabled={mfaSaving || mfaCode.length !== 6}
          >
            {mfaSaving ? "Verifying…" : "Verify"}
          </Button>
          <button
            onClick={() => {
              setEnrollData(null);
              setMfaCode("");
              setMfaError("");
            }}
            className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Cancel
          </button>
        </div>
        {mfaError && <p className="text-xs text-red-400 mt-1">{mfaError}</p>}
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.06]">
      <h3 className="font-semibold text-white mb-1 text-sm">
        Two-factor authentication
      </h3>
      <p className="text-zinc-500 text-xs mb-4">
        Add an extra layer of security to your account with an authenticator
        app.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEnroll}
        className="border-white/10 text-zinc-300 hover:bg-white/6"
      >
        Enable 2FA
      </Button>
    </div>
  );
}

export function SettingsContent({
  userEmail,
  integrations,
  alertConfigs,
  alertChannels,
  tier,
  subscriptionStatus,
  trialEndsAt,
  nextBillingAt,
  cancelAtPeriodEnd = false,
  defaultTab = "alerts",
  snapshotMetrics = {},
}: SettingsContentProps) {
  const isPro = tier === "pro" || tier === "team";
  const isTrialing = subscriptionStatus === "trialing";
  const isPastDue = subscriptionStatus === "past_due";
  const router = useRouter();
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

  const [slackError, setSlackError] = useState("");
  const [discordError, setDiscordError] = useState("");

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
              const available = snapshotMetrics[intg.id] ?? [];
              const metrics = [
                ...(DEFAULT_METRICS[intg.service] ?? []),
                ...(isPro
                  ? (PRO_METRICS[intg.service] ?? []).filter(
                      (m) => available.length === 0 || available.includes(m),
                    )
                  : []),
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
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackUrl}
                    onChange={(e) => { setSlackUrl(e.target.value); if (slackError) setSlackError(""); }}
                    className={slackError ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!slackUrl.trim()) { setSlackError("Webhook URL is required."); return; }
                      if (!slackUrl.startsWith("https://")) { setSlackError("Must be a valid HTTPS URL."); return; }
                      setSlackError("");
                      saveWebhookChannel("slack", slackUrl, slackEnabled);
                    }}
                    className="border-white/10 text-zinc-300 hover:bg-white/6 shrink-0"
                  >
                    Save
                  </Button>
                </div>
                {slackError && <p className="text-xs text-red-400">{slackError}</p>}
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
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordUrl}
                    onChange={(e) => { setDiscordUrl(e.target.value); if (discordError) setDiscordError(""); }}
                    className={discordError ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!discordUrl.trim()) { setDiscordError("Webhook URL is required."); return; }
                      if (!discordUrl.startsWith("https://")) { setDiscordError("Must be a valid HTTPS URL."); return; }
                      setDiscordError("");
                      saveWebhookChannel("discord", discordUrl, discordEnabled);
                    }}
                    className="border-white/10 text-zinc-300 hover:bg-white/6 shrink-0"
                  >
                    Save
                  </Button>
                </div>
                {discordError && <p className="text-xs text-red-400">{discordError}</p>}
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ── Billing ── */}
      <TabsContent value="billing">
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6 max-w-lg">
          <h3 className="font-semibold text-white mb-1 text-sm">Current plan</h3>

          {isTrialing ? (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium text-white capitalize">{tier}</span>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  Free trial
                </span>
                {cancelAtPeriodEnd && (
                  <span className="text-[10px] font-semibold text-zinc-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    Cancelling
                  </span>
                )}
              </div>
              {trialEndsAt && (
                <p className="text-zinc-500 text-xs">
                  {cancelAtPeriodEnd
                    ? `Trial ends ${new Date(trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. No charge will be made.`
                    : `Trial ends ${new Date(trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. You'll be charged $120/yr after unless you cancel.`}
                </p>
              )}
            </div>
          ) : isPastDue ? (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium text-white capitalize">{tier}</span>
                <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  Payment failed
                </span>
              </div>
              <p className="text-zinc-500 text-xs">
                Your last payment didn't go through. Update your payment method to keep Pro access.
              </p>
            </div>
          ) : isPro ? (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-white capitalize">{tier}</p>
                {cancelAtPeriodEnd && (
                  <span className="text-[10px] font-semibold text-zinc-500 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    Cancelling
                  </span>
                )}
              </div>
              {cancelAtPeriodEnd ? (
                <p className="text-zinc-500 text-xs">
                  {nextBillingAt
                    ? `Pro access continues until ${new Date(nextBillingAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. No further charges.`
                    : "Your subscription won't renew. Pro access continues until the end of your billing period."}
                </p>
              ) : nextBillingAt ? (
                <p className="text-zinc-500 text-xs">
                  Next payment on{" "}
                  {new Date(nextBillingAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm mb-5 capitalize">{tier}</p>
          )}

          {isPastDue ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-zinc-300 mb-3">
                To restore Pro access, start a new subscription below.
              </p>
              <UpgradeButton />
            </div>
          ) : !isPro && !isTrialing ? (
            <div>
              <p className="text-zinc-400 text-sm mb-4">
                Upgrade to Pro for multiple accounts, Slack &amp; Discord alerts, 5-minute polling, and 30-day history.
              </p>
              <UpgradeButton />
            </div>
          ) : cancelAtPeriodEnd ? (
            <p className="text-sm text-zinc-600">
              Your cancellation is scheduled. You can reactivate anytime before your access expires.
            </p>
          ) : (
            <div className="space-y-5">
              {!isTrialing && <ManagePortalButton />}
              <div className={isTrialing ? "" : "border-t border-white/6 pt-5"}>
                {!isTrialing && <p className="text-xs text-zinc-600 mb-3">Danger zone</p>}
                <CancelSubscriptionButton isTrialing={isTrialing} onCancelled={() => router.refresh()} />
              </div>
            </div>
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
          <MfaSection />
        </div>
      </TabsContent>
    </Tabs>
  );
}
