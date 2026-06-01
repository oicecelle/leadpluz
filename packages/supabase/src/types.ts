export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          plan: 'starter' | 'pro' | 'ultra';
          plan_status: 'active' | 'inactive' | 'cancelled' | 'trial';
          plan_started_at: string | null;
          plan_expires_at: string | null;
          leads_used_this_cycle: number;
          leads_limit: number;
          lastlink_customer_id: string | null;
          lastlink_subscription_id: string | null;
          chatwoot_account_id: string | null;
          chatwoot_access_token: string | null;
          chatwoot_url: string | null;
          uazapi_instance_id: string | null;
          uazapi_instance_status: 'disconnected' | 'connecting' | 'connected';
          uazapi_qr_code: string | null;
          is_admin: boolean;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          plan?: 'starter' | 'pro' | 'ultra';
          plan_status?: 'active' | 'inactive' | 'cancelled' | 'trial';
          plan_started_at?: string | null;
          plan_expires_at?: string | null;
          leads_used_this_cycle?: number;
          leads_limit?: number;
          lastlink_customer_id?: string | null;
          lastlink_subscription_id?: string | null;
          chatwoot_account_id?: string | null;
          chatwoot_access_token?: string | null;
          chatwoot_url?: string | null;
          uazapi_instance_id?: string | null;
          uazapi_instance_status?: 'disconnected' | 'connecting' | 'connected';
          uazapi_qr_code?: string | null;
          is_admin?: boolean;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          plan?: 'starter' | 'pro' | 'ultra';
          plan_status?: 'active' | 'inactive' | 'cancelled' | 'trial';
          plan_started_at?: string | null;
          plan_expires_at?: string | null;
          leads_used_this_cycle?: number;
          leads_limit?: number;
          lastlink_customer_id?: string | null;
          lastlink_subscription_id?: string | null;
          chatwoot_account_id?: string | null;
          chatwoot_access_token?: string | null;
          chatwoot_url?: string | null;
          uazapi_instance_id?: string | null;
          uazapi_instance_status?: 'disconnected' | 'connecting' | 'connected';
          uazapi_qr_code?: string | null;
          is_admin?: boolean;
          is_blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads_geral: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          email: string | null;
          instagram: string | null;
          tiktok: string | null;
          website: string | null;
          source: 'google' | 'import' | 'manual';
          search_keyword: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          website?: string | null;
          source?: 'google' | 'import' | 'manual';
          search_keyword?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          website?: string | null;
          source?: 'google' | 'import' | 'manual';
          search_keyword?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_leads: {
        Row: {
          id: string;
          user_id: string;
          lead_id: string | null;
          name: string;
          category: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          email: string | null;
          instagram: string | null;
          tiktok: string | null;
          website: string | null;
          status: 'new' | 'contacted' | 'proposal_sent' | 'converted' | 'no_interest';
          notes: string | null;
          kanban_column_id: string | null;
          kanban_position: number;
          source_type: 'google' | 'instagram' | 'tiktok' | 'import' | 'manual' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lead_id?: string | null;
          name: string;
          category?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          website?: string | null;
          status?: 'new' | 'contacted' | 'proposal_sent' | 'converted' | 'no_interest';
          notes?: string | null;
          kanban_column_id?: string | null;
          kanban_position?: number;
          source_type?: 'google' | 'instagram' | 'tiktok' | 'import' | 'manual' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lead_id?: string | null;
          name?: string;
          category?: string | null;
          city?: string | null;
          state?: string | null;
          phone?: string | null;
          email?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          website?: string | null;
          status?: 'new' | 'contacted' | 'proposal_sent' | 'converted' | 'no_interest';
          notes?: string | null;
          kanban_column_id?: string | null;
          kanban_position?: number;
          source_type?: 'google' | 'instagram' | 'tiktok' | 'import' | 'manual' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      kanban_columns: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          position: number;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          position?: number;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          position?: number;
          color?: string;
          created_at?: string;
        };
      };
      lead_usage_log: {
        Row: {
          id: string;
          user_id: string;
          leads_count: number;
          search_keyword: string | null;
          search_location: string | null;
          source: 'google_api' | 'internal_cache' | 'instagram' | 'tiktok' | 'import';
          cycle_start: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          leads_count: number;
          search_keyword?: string | null;
          search_location?: string | null;
          source: 'google_api' | 'internal_cache' | 'instagram' | 'tiktok' | 'import';
          cycle_start?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          leads_count?: number;
          search_keyword?: string | null;
          search_location?: string | null;
          source?: 'google_api' | 'internal_cache' | 'instagram' | 'tiktok' | 'import';
          cycle_start?: string | null;
          created_at?: string;
        };
      };
      dispatch_flows: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          api_type: 'unofficial' | 'official';
          is_active: boolean;
          whatsapp_instance_id: string | null;
          chatwoot_inbox_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          api_type: 'unofficial' | 'official';
          is_active?: boolean;
          whatsapp_instance_id?: string | null;
          chatwoot_inbox_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          api_type?: 'unofficial' | 'official';
          is_active?: boolean;
          whatsapp_instance_id?: string | null;
          chatwoot_inbox_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      dispatch_steps: {
        Row: {
          id: string;
          flow_id: string;
          position: number;
          type: 'message' | 'trigger' | 'wait';
          message_text: string | null;
          message_type: 'text' | 'image' | 'file';
          media_url: string | null;
          trigger_keyword: string | null;
          status_after_send: 'new' | 'contacted' | 'proposal_sent' | 'converted' | 'no_interest' | null;
          meta_template_name: string | null;
          wait_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          flow_id: string;
          position: number;
          type: 'message' | 'trigger' | 'wait';
          message_text?: string | null;
          message_type?: 'text' | 'image' | 'file';
          media_url?: string | null;
          trigger_keyword?: string | null;
          status_after_send?: 'new' | 'contacted' | 'proposal_sent' | 'converted' | 'no_interest' | null;
          meta_template_name?: string | null;
          wait_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          flow_id?: string;
          position?: number;
          type?: 'message' | 'trigger' | 'wait';
          message_text?: string | null;
          message_type?: 'text' | 'image' | 'file';
          media_url?: string | null;
          trigger_keyword?: string | null;
          status_after_send?: 'new' | 'contacted' | 'proposal_sent' | 'converted' | 'no_interest' | null;
          meta_template_name?: string | null;
          wait_minutes?: number | null;
          created_at?: string;
        };
      };
      dispatch_jobs: {
        Row: {
          id: string;
          user_id: string;
          flow_id: string | null;
          status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
          total_leads: number;
          sent_count: number;
          failed_count: number;
          filter_status: string | null;
          filter_category: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flow_id?: string | null;
          status?: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
          total_leads?: number;
          sent_count?: number;
          failed_count?: number;
          filter_status?: string | null;
          filter_category?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flow_id?: string | null;
          status?: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
          total_leads?: number;
          sent_count?: number;
          failed_count?: number;
          filter_status?: string | null;
          filter_category?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      dispatch_lead_jobs: {
        Row: {
          id: string;
          job_id: string;
          user_lead_id: string;
          status: 'pending' | 'sent' | 'failed' | 'replied';
          sent_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_lead_id: string;
          status?: 'pending' | 'sent' | 'failed' | 'replied';
          sent_at?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_lead_id?: string;
          status?: 'pending' | 'sent' | 'failed' | 'replied';
          sent_at?: string | null;
          error_message?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          user_lead_id: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes: number;
          platform: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
          meeting_url: string | null;
          notes: string | null;
          status: 'upcoming' | 'completed' | 'cancelled' | 'no_show';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_lead_id?: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes?: number;
          platform?: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
          meeting_url?: string | null;
          notes?: string | null;
          status?: 'upcoming' | 'completed' | 'cancelled' | 'no_show';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_lead_id?: string | null;
          title?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          platform?: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
          meeting_url?: string | null;
          notes?: string | null;
          status?: 'upcoming' | 'completed' | 'cancelled' | 'no_show';
          created_at?: string;
          updated_at?: string;
        };
      };
      search_cache: {
        Row: {
          id: string;
          keyword: string;
          city: string | null;
          state: string | null;
          result_count: number;
          last_fetched_at: string;
        };
        Insert: {
          id?: string;
          keyword: string;
          city?: string | null;
          state?: string | null;
          result_count?: number;
          last_fetched_at?: string;
        };
        Update: {
          id?: string;
          keyword?: string;
          city?: string | null;
          state?: string | null;
          result_count?: number;
          last_fetched_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_percent: number | null;
          discount_fixed: number | null;
          plan: string | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percent?: number | null;
          discount_fixed?: number | null;
          plan?: string | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percent?: number | null;
          discount_fixed?: number | null;
          plan?: string | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          target_user_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          target_user_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          target_user_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          status: 'open' | 'in_progress' | 'closed';
          admin_reply: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          status?: 'open' | 'in_progress' | 'closed';
          admin_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          status?: 'open' | 'in_progress' | 'closed';
          admin_reply?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_cost_log: {
        Row: {
          id: string;
          user_id: string | null;
          keyword: string | null;
          city: string | null;
          calls_made: number;
          results_returned: number;
          estimated_cost_usd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          keyword?: string | null;
          city?: string | null;
          calls_made?: number;
          results_returned?: number;
          estimated_cost_usd?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          keyword?: string | null;
          city?: string | null;
          calls_made?: number;
          results_returned?: number;
          estimated_cost_usd?: number;
          created_at?: string;
        };
      };
    };
  };
}
