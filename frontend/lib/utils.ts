import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(percent: number): "green" | "yellow" | "red" {
  if (percent >= 80) return "red";
  if (percent >= 60) return "yellow";
  return "green";
}

export function getStatusColorClass(percent: number): string {
  const color = getStatusColor(percent);
  return {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-500",
  }[color];
}

export function getProgressColorClass(percent: number): string {
  const color = getStatusColor(percent);
  return {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  }[color];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export const SERVICE_LABELS: Record<string, string> = {
  github: "GitHub Actions",
  vercel: "Vercel",
  supabase: "Supabase",
};

export const METRIC_LABELS: Record<string, string> = {
  actions_minutes: "Actions Minutes",
  bandwidth_gb: "Bandwidth",
  build_minutes: "Build Minutes",
  function_invocations: "Function Invocations",
  db_size_mb: "Database Size",
  row_count: "Row Count",
  storage_mb: "Storage",
  monthly_active_users: "Monthly Active Users",
};

export const METRIC_UNITS: Record<string, string> = {
  actions_minutes: "min",
  bandwidth_gb: "GB",
  build_minutes: "min",
  function_invocations: "req",
  db_size_mb: "MB",
  row_count: "rows",
  storage_mb: "MB",
  monthly_active_users: "MAU",
};
