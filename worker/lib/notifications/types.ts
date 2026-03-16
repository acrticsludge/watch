import type { ChannelType, Json } from "../database.types";

export interface AlertPayload {
  userId: string;
  integrationId: string;
  service: string;
  accountLabel: string;
  metricName: string;
  currentValue: number;
  limitValue: number;
  percentUsed: number;
  recordedAt: string;
}

export interface AlertChannel {
  id: string;
  user_id: string;
  type: ChannelType;
  config: Json;
  enabled: boolean;
}
