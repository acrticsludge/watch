export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceType = "github" | "vercel" | "supabase" | "railway" | "mongodb";
export type IntegrationStatus = "connected" | "error" | "disconnected" | "unsupported";
export type ChannelType = "email" | "slack" | "discord" | "push";

export type Database = {
  public: {
    Tables: {
      integrations: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          service: ServiceType;
          account_label: string;
          api_key: string;
          status: IntegrationStatus;
          created_at: string;
          last_synced_at: string | null;
          meta: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          service: ServiceType;
          account_label: string;
          api_key: string;
          status?: IntegrationStatus;
          created_at?: string;
          last_synced_at?: string | null;
          meta?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          service?: ServiceType;
          account_label?: string;
          api_key?: string;
          status?: IntegrationStatus;
          created_at?: string;
          last_synced_at?: string | null;
          meta?: Json | null;
        };
        Relationships: [];
      };
      usage_snapshots: {
        Row: {
          id: string;
          integration_id: string;
          metric_name: string;
          current_value: number;
          limit_value: number | null;
          percent_used: number | null;
          entity_id: string | null;
          entity_label: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          integration_id: string;
          metric_name: string;
          current_value: number;
          limit_value: number | null;
          percent_used: number | null;
          entity_id?: string | null;
          entity_label?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          integration_id?: string;
          metric_name?: string;
          current_value?: number;
          limit_value?: number;
          percent_used?: number;
          entity_id?: string | null;
          entity_label?: string | null;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_snapshots_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "integrations";
            referencedColumns: ["id"];
          }
        ];
      };
      alert_configs: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          threshold_percent: number;
          enabled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          threshold_percent?: number;
          enabled?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string;
          metric_name?: string;
          threshold_percent?: number;
          enabled?: boolean;
        };
        Relationships: [];
      };
      alert_channels: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          type: ChannelType;
          config: Json;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          type: ChannelType;
          config?: Json;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          type?: ChannelType;
          config?: Json;
          enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: "free" | "pro" | "team";
          status: "active" | "trialing" | "past_due" | "cancelled" | "canceled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: "free" | "pro" | "team";
          status?: "active" | "trialing" | "past_due" | "cancelled" | "canceled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: "free" | "pro" | "team";
          status?: "active" | "trialing" | "past_due" | "cancelled" | "canceled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      spike_configs: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          enabled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          enabled?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string;
          metric_name?: string;
          enabled?: boolean;
        };
        Relationships: [];
      };
      alert_history: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          percent_used: number | null;
          channel: ChannelType;
          sent_at: string;
          alert_kind: "threshold" | "spike";
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          percent_used: number | null;
          channel: ChannelType;
          sent_at?: string;
          alert_kind?: "threshold" | "spike";
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string;
          metric_name?: string;
          percent_used?: number;
          channel?: ChannelType;
          sent_at?: string;
          alert_kind?: "threshold" | "spike";
        };
        Relationships: [
          {
            foreignKeyName: "alert_history_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "integrations";
            referencedColumns: ["id"];
          }
        ];
      };
      onboarding_emails: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
