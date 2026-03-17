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

export const FREE_METRICS: Record<string, string[]> = {
  github: ["actions_minutes"],
  vercel: ["bandwidth_gb", "build_minutes", "function_invocations"],
  supabase: ["db_size_mb", "storage_mb", "monthly_active_users"],
  railway: ["memory_usage_mb", "cpu_percent"],
};

export const SERVICE_LABELS: Record<string, string> = {
  github: "GitHub Actions",
  vercel: "Vercel",
  supabase: "Supabase",
  railway: "Railway",
};

export const METRIC_LABELS: Record<string, string> = {
  // GitHub — free
  actions_minutes: "Actions Minutes",
  // GitHub — pro
  actions_minutes_ubuntu: "Ubuntu Runner Minutes",
  actions_minutes_macos: "macOS Runner Minutes",
  actions_minutes_windows: "Windows Runner Minutes",
  packages_bandwidth_gb: "Packages Bandwidth",
  actions_storage_gb: "Actions Storage",
  // Vercel — free
  bandwidth_gb: "Bandwidth",
  build_minutes: "Build Minutes",
  function_invocations: "Function Invocations",
  // Vercel — pro
  edge_function_execution_ms: "Edge Function Execution",
  image_optimizations: "Image Optimizations",
  analytics_events: "Analytics Events",
  deployments: "Deployments",
  // Supabase — free
  db_size_mb: "Database Size",
  row_count: "Row Count",
  storage_mb: "Storage",
  monthly_active_users: "Monthly Active Users",
  // Supabase — pro
  db_connections: "Active Connections",
  cache_hit_ratio: "Cache Hit Ratio",
  realtime_messages: "Realtime Messages",
  realtime_peak_connections: "Peak Realtime Connections",
  func_invocations: "Edge Function Invocations",
  db_egress_mb: "Database Egress",
  // Railway — free
  memory_usage_mb: "Memory Usage",
  cpu_percent: "CPU Usage",
  // Railway — pro
  cpu_peak_percent: "Peak CPU",
  memory_peak_mb: "Peak Memory",
  network_tx_mb: "Network Egress",
  network_rx_mb: "Network Ingress",
  disk_usage_mb: "Disk Usage",
};

export const METRIC_UNITS: Record<string, string> = {
  // GitHub — free
  actions_minutes: "min",
  // GitHub — pro
  actions_minutes_ubuntu: "min",
  actions_minutes_macos: "min",
  actions_minutes_windows: "min",
  packages_bandwidth_gb: "GB",
  actions_storage_gb: "GB",
  // Vercel — free
  bandwidth_gb: "GB",
  build_minutes: "min",
  function_invocations: "req",
  // Vercel — pro
  edge_function_execution_ms: "ms",
  image_optimizations: "req",
  analytics_events: "events",
  deployments: "deploys",
  // Supabase — free
  db_size_mb: "MB",
  row_count: "rows",
  storage_mb: "MB",
  monthly_active_users: "MAU",
  // Supabase — pro
  db_connections: "conn",
  cache_hit_ratio: "%",
  realtime_messages: "msg",
  realtime_peak_connections: "conn",
  func_invocations: "req",
  db_egress_mb: "MB",
  // Railway — free
  memory_usage_mb: "MB",
  cpu_percent: "%",
  // Railway — pro
  cpu_peak_percent: "%",
  memory_peak_mb: "MB",
  network_tx_mb: "MB",
  network_rx_mb: "MB",
  disk_usage_mb: "MB",
};
