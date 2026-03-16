// Subset of frontend lib/utils.ts — only what the worker needs (no UI deps)

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
