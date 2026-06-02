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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_cost_log: {
        Row: {
          calls_made: number | null
          city: string | null
          created_at: string | null
          estimated_cost_usd: number | null
          id: string
          keyword: string | null
          results_returned: number | null
          user_id: string | null
        }
        Insert: {
          calls_made?: number | null
          city?: string | null
          created_at?: string | null
          estimated_cost_usd?: number | null
          id?: string
          keyword?: string | null
          results_returned?: number | null
          user_id?: string | null
        }
        Update: {
          calls_made?: number | null
          city?: string | null
          created_at?: string | null
          estimated_cost_usd?: number | null
          id?: string
          keyword?: string | null
          results_returned?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_cost_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_fixed: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          plan: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_fixed?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          plan?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_fixed?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          plan?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      dispatch_flows: {
        Row: {
          api_type: string
          chatwoot_inbox_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
          whatsapp_instance_id: string | null
        }
        Insert: {
          api_type: string
          chatwoot_inbox_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_instance_id?: string | null
        }
        Update: {
          api_type?: string
          chatwoot_inbox_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_flows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          failed_count: number | null
          filter_category: string | null
          filter_status: string | null
          flow_id: string | null
          id: string
          sent_count: number | null
          started_at: string | null
          status: string | null
          total_leads: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          failed_count?: number | null
          filter_category?: string | null
          filter_status?: string | null
          flow_id?: string | null
          id?: string
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          total_leads?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          failed_count?: number | null
          filter_category?: string | null
          filter_status?: string | null
          flow_id?: string | null
          id?: string
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          total_leads?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_jobs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "dispatch_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_lead_jobs: {
        Row: {
          error_message: string | null
          id: string
          job_id: string | null
          sent_at: string | null
          status: string | null
          user_lead_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          job_id?: string | null
          sent_at?: string | null
          status?: string | null
          user_lead_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          job_id?: string | null
          sent_at?: string | null
          status?: string | null
          user_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_lead_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "dispatch_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_lead_jobs_user_lead_id_fkey"
            columns: ["user_lead_id"]
            isOneToOne: false
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_steps: {
        Row: {
          created_at: string | null
          flow_id: string | null
          id: string
          media_url: string | null
          message_text: string | null
          message_type: string | null
          meta_template_name: string | null
          position: number
          status_after_send: string | null
          trigger_keyword: string | null
          trigger_type: string | null
          type: string
          wait_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          flow_id?: string | null
          id?: string
          media_url?: string | null
          message_text?: string | null
          message_type?: string | null
          meta_template_name?: string | null
          position: number
          status_after_send?: string | null
          trigger_keyword?: string | null
          trigger_type?: string | null
          type: string
          wait_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          flow_id?: string | null
          id?: string
          media_url?: string | null
          message_text?: string | null
          message_type?: string | null
          meta_template_name?: string | null
          position?: number
          status_after_send?: string | null
          trigger_keyword?: string | null
          trigger_type?: string | null
          type?: string
          wait_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "dispatch_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          position: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          position?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          position?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_usage_log: {
        Row: {
          created_at: string | null
          cycle_start: string | null
          id: string
          leads_count: number
          search_keyword: string | null
          search_location: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_start?: string | null
          id?: string
          leads_count: number
          search_keyword?: string | null
          search_location?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_start?: string | null
          id?: string
          leads_count?: number
          search_keyword?: string | null
          search_location?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_geral: {
        Row: {
          category: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          instagram: string | null
          name: string
          phone: string | null
          search_keyword: string | null
          source: string | null
          state: string | null
          tiktok: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name: string
          phone?: string | null
          search_keyword?: string | null
          source?: string | null
          state?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string
          phone?: string | null
          search_keyword?: string | null
          source?: string | null
          state?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          chatwoot_access_token: string | null
          chatwoot_account_id: string | null
          chatwoot_url: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          lastlink_customer_id: string | null
          lastlink_subscription_id: string | null
          leads_limit: number | null
          leads_used_this_cycle: number | null
          name: string
          plan: string | null
          plan_expires_at: string | null
          plan_started_at: string | null
          plan_status: string | null
          uazapi_base_url: string | null
          uazapi_instance_id: string | null
          uazapi_instance_status: string | null
          uazapi_qr_code: string | null
          uazapi_token: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          chatwoot_access_token?: string | null
          chatwoot_account_id?: string | null
          chatwoot_url?: string | null
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          lastlink_customer_id?: string | null
          lastlink_subscription_id?: string | null
          leads_limit?: number | null
          leads_used_this_cycle?: number | null
          name: string
          plan?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          plan_status?: string | null
          uazapi_base_url?: string | null
          uazapi_instance_id?: string | null
          uazapi_instance_status?: string | null
          uazapi_qr_code?: string | null
          uazapi_token?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          chatwoot_access_token?: string | null
          chatwoot_account_id?: string | null
          chatwoot_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          lastlink_customer_id?: string | null
          lastlink_subscription_id?: string | null
          leads_limit?: number | null
          leads_used_this_cycle?: number | null
          name?: string
          plan?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          plan_status?: string | null
          uazapi_base_url?: string | null
          uazapi_instance_id?: string | null
          uazapi_instance_status?: string | null
          uazapi_qr_code?: string | null
          uazapi_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          notes: string | null
          platform: string | null
          scheduled_at: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          user_lead_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          platform?: string | null
          scheduled_at: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          user_lead_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          platform?: string | null
          scheduled_at?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          user_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_user_lead_id_fkey"
            columns: ["user_lead_id"]
            isOneToOne: false
            referencedRelation: "user_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      search_cache: {
        Row: {
          city: string | null
          id: string
          keyword: string
          last_fetched_at: string | null
          result_count: number | null
          state: string | null
        }
        Insert: {
          city?: string | null
          id?: string
          keyword: string
          last_fetched_at?: string | null
          result_count?: number | null
          state?: string | null
        }
        Update: {
          city?: string | null
          id?: string
          keyword?: string
          last_fetched_at?: string | null
          result_count?: number | null
          state?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_leads: {
        Row: {
          category: string | null
          city: string | null
          contacted_at: string | null
          created_at: string | null
          email: string | null
          id: string
          instagram: string | null
          kanban_column_id: string | null
          kanban_position: number | null
          lead_id: string | null
          name: string
          notes: string | null
          phone: string | null
          source_type: string | null
          state: string | null
          status: string | null
          tiktok: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          contacted_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          kanban_column_id?: string | null
          kanban_position?: number | null
          lead_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source_type?: string | null
          state?: string | null
          status?: string | null
          tiktok?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          contacted_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          kanban_column_id?: string | null
          kanban_position?: number | null
          lead_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source_type?: string | null
          state?: string | null
          status?: string | null
          tiktok?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_leads_kanban_column_id_fkey"
            columns: ["kanban_column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_geral"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_leads_geral: {
        Args: { p_city: string; p_keyword: string; p_limit: number }
        Returns: {
          category: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          instagram: string | null
          name: string
          phone: string | null
          search_keyword: string | null
          source: string | null
          state: string | null
          tiktok: string | null
          updated_at: string | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "leads_geral"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
