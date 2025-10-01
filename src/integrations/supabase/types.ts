export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_logs: {
        Row: {
          consent_brand: boolean
          consent_rafl: boolean
          consent_text: string | null
          created_at: string
          entry_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          consent_brand?: boolean
          consent_rafl?: boolean
          consent_text?: string | null
          created_at?: string
          entry_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          consent_brand?: boolean
          consent_rafl?: boolean
          consent_text?: string | null
          created_at?: string
          entry_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_logs_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          created_at: string
          hashed_email: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          promo_id: string
          source: Database["public"]["Enums"]["entry_source"]
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          hashed_email: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          promo_id: string
          source: Database["public"]["Enums"]["entry_source"]
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          hashed_email?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          promo_id?: string
          source?: Database["public"]["Enums"]["entry_source"]
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promos"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaways: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          prize_amount: number
          start_date: string | null
          status: Database["public"]["Enums"]["giveaway_status"]
          store_id: string
          title: string
          total_entries: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          prize_amount?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["giveaway_status"]
          store_id: string
          title: string
          total_entries?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          prize_amount?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["giveaway_status"]
          store_id?: string
          title?: string
          total_entries?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaways_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          created_at: string
          email: string
          entry_count: number
          entry_type: string
          giveaway_id: string
          id: string
          purchase_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          entry_count?: number
          entry_type?: string
          giveaway_id: string
          id?: string
          purchase_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          entry_count?: number
          entry_type?: string
          giveaway_id?: string
          id?: string
          purchase_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      promos: {
        Row: {
          amoe_instructions: string | null
          created_at: string
          eligibility_text: string | null
          enable_purchase_entries: boolean | null
          end_date: string | null
          entries_per_dollar: number | null
          id: string
          max_entries_per_email: number | null
          max_entries_per_ip: number | null
          prize_amount: number
          prize_description: string
          rules_text: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["promo_status"]
          store_id: string
          title: string
          updated_at: string
        }
        Insert: {
          amoe_instructions?: string | null
          created_at?: string
          eligibility_text?: string | null
          enable_purchase_entries?: boolean | null
          end_date?: string | null
          entries_per_dollar?: number | null
          id?: string
          max_entries_per_email?: number | null
          max_entries_per_ip?: number | null
          prize_amount?: number
          prize_description: string
          rules_text?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["promo_status"]
          store_id: string
          title: string
          updated_at?: string
        }
        Update: {
          amoe_instructions?: string | null
          created_at?: string
          eligibility_text?: string | null
          enable_purchase_entries?: boolean | null
          end_date?: string | null
          entries_per_dollar?: number | null
          id?: string
          max_entries_per_email?: number | null
          max_entries_per_ip?: number | null
          prize_amount?: number
          prize_description?: string
          rules_text?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["promo_status"]
          store_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promos_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          id: string
          order_date: string
          shopify_order_id: string
          shopify_shop_id: string
          total_amount_usd: number
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          id?: string
          order_date: string
          shopify_order_id: string
          shopify_shop_id: string
          total_amount_usd?: number
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          id?: string
          order_date?: string
          shopify_order_id?: string
          shopify_shop_id?: string
          total_amount_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_shopify_shop_id_fkey"
            columns: ["shopify_shop_id"]
            isOneToOne: false
            referencedRelation: "shopify_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_shops: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          shop_domain: string
          store_id: string
          updated_at: string
          webhook_verified: boolean | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          shop_domain: string
          store_id: string
          updated_at?: string
          webhook_verified?: boolean | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          shop_domain?: string
          store_id?: string
          updated_at?: string
          webhook_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "shopify_shops_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["store_status"]
          store_name: string
          store_url: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["store_status"]
          store_name: string
          store_url: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["store_status"]
          store_name?: string
          store_url?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_purchase_entries: {
        Args: { amount_usd: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "store_manager" | "store_owner"
      entry_source:
        | "klaviyo"
        | "mailchimp"
        | "aweber"
        | "sendgrid"
        | "amoe"
        | "purchase"
        | "direct"
      giveaway_status: "draft" | "active" | "completed"
      promo_status: "draft" | "active" | "paused" | "ended"
      store_status: "active" | "suspended"
      subscription_tier: "free" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "store_manager", "store_owner"],
      entry_source: [
        "klaviyo",
        "mailchimp",
        "aweber",
        "sendgrid",
        "amoe",
        "purchase",
        "direct",
      ],
      giveaway_status: ["draft", "active", "completed"],
      promo_status: ["draft", "active", "paused", "ended"],
      store_status: ["active", "suspended"],
      subscription_tier: ["free", "premium"],
    },
  },
} as const
