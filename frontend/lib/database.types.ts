export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceType = "github" | "vercel" | "supabase" | "railway";
export type IntegrationStatus = "connected" | "error" | "disconnected" | "unsupported";
export type ChannelType = "email" | "slack" | "discord" | "push";

export type Database = {
  public: {
    Tables: {
      integrations: {
        Row: {
          id: string;
          user_id: string;
          service: ServiceType;
          account_label: string;
          api_key: string;
          status: IntegrationStatus;
          created_at: string;
          last_synced_at: string | null;
          meta: Json | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          service: ServiceType;
          account_label: string;
          api_key: string;
          status?: IntegrationStatus;
          created_at?: string;
          last_synced_at?: string | null;
          meta?: Json | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          service?: ServiceType;
          account_label?: string;
          api_key?: string;
          status?: IntegrationStatus;
          created_at?: string;
          last_synced_at?: string | null;
          meta?: Json | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      usage_snapshots: {
        Row: {
          id: string;
          integration_id: string;
          metric_name: string;
          current_value: number;
          limit_value: number;
          percent_used: number;
          entity_id: string | null;
          entity_label: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          integration_id: string;
          metric_name: string;
          current_value: number;
          limit_value: number;
          percent_used: number;
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
          type: ChannelType;
          config: Json;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ChannelType;
          config?: Json;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
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
          trial_ends_at: string | null;
          next_billing_at: string | null;
          created_at: string;
          updated_at: string;
          dodo_subscription_id: string | null;
          dodo_customer_id: string | null;
          dodo_product_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: "free" | "pro" | "team";
          status?: "active" | "trialing" | "past_due" | "cancelled" | "canceled";
          trial_ends_at?: string | null;
          next_billing_at?: string | null;
          created_at?: string;
          updated_at?: string;
          dodo_subscription_id?: string | null;
          dodo_customer_id?: string | null;
          dodo_product_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: "free" | "pro" | "team";
          status?: "active" | "trialing" | "past_due" | "cancelled" | "canceled";
          trial_ends_at?: string | null;
          next_billing_at?: string | null;
          created_at?: string;
          updated_at?: string;
          dodo_subscription_id?: string | null;
          dodo_customer_id?: string | null;
          dodo_product_id?: string | null;
        };
        Relationships: [];
      };
      alert_history: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          percent_used: number;
          channel: ChannelType;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id: string;
          metric_name: string;
          percent_used: number;
          channel: ChannelType;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string;
          metric_name?: string;
          percent_used?: number;
          channel?: ChannelType;
          sent_at?: string;
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
