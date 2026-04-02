import type { ChannelType, Json } from "../database.types";

export interface AlertPayload {
  userId: string;
  integrationId: string;
  service: string;
  accountLabel: string;
  metricName: string;
  currentValue: number;
  limitValue: number | null;
  percentUsed: number | null;
  recordedAt: string;
  topEntity?: { label: string; valueMb: number }; // highest sub-entity (e.g. top DB for MongoDB storage_mb)
  alertKind?: "threshold" | "spike";              // default 'threshold' when absent
  spikeContext?: { baseline: number; multiplier: number }; // e.g. 3.2× above baseline of 120 MB
}

export interface AlertChannel {
  id: string;
  user_id: string;
  type: ChannelType;
  config: Json;
  enabled: boolean;
}
