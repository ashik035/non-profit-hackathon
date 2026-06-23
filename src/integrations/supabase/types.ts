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
      activity_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          id: string | null
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string | null
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string | null
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string | null
          is_archived: boolean | null
          is_pinned: boolean | null
          last_message_at: string | null
          message_count: number | null
          metadata: Json | null
          summary: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string | null
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string | null
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      agent_learning_events: {
        Row: {
          agent_action_taken: string | null
          agent_id: string | null
          behavior_change: string | null
          created_at: string | null
          event_description: string | null
          event_type: string | null
          feedback_text: string | null
          feedback_type: string | null
          id: string | null
          related_conversation_id: string | null
          related_memory_id: string | null
          related_message_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_action_taken?: string | null
          agent_id?: string | null
          behavior_change?: string | null
          created_at?: string | null
          event_description?: string | null
          event_type?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string | null
          related_conversation_id?: string | null
          related_memory_id?: string | null
          related_message_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_action_taken?: string | null
          agent_id?: string | null
          behavior_change?: string | null
          created_at?: string | null
          event_description?: string | null
          event_type?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string | null
          related_conversation_id?: string | null
          related_memory_id?: string | null
          related_message_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      agent_memories: {
        Row: {
          access_count: number | null
          agent_id: string | null
          consolidated: boolean | null
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string | null
          importance_score: number | null
          is_active: boolean | null
          last_accessed_at: string | null
          memory_category: string | null
          memory_type: string | null
          metadata: Json | null
          source_id: string | null
          source_type: string | null
          summary: string | null
          superseded_by: string | null
          updated_at: string | null
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          consolidated?: boolean | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string | null
          importance_score?: number | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_category?: string | null
          memory_type?: string | null
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          summary?: string | null
          superseded_by?: string | null
          updated_at?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          consolidated?: boolean | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string | null
          importance_score?: number | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_category?: string | null
          memory_type?: string | null
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          summary?: string | null
          superseded_by?: string | null
          updated_at?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          citations: Json | null
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string | null
          is_streaming: boolean | null
          latency_ms: number | null
          metadata: Json | null
          model_used: string | null
          provider_used: string | null
          role: string | null
          stream_completed_at: string | null
          tokens_input: number | null
          tokens_output: number | null
          tool_call_status: string | null
          tool_calls: string | null
          tool_results: string | null
        }
        Insert: {
          citations?: Json | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string | null
          is_streaming?: boolean | null
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          provider_used?: string | null
          role?: string | null
          stream_completed_at?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tool_call_status?: string | null
          tool_calls?: string | null
          tool_results?: string | null
        }
        Update: {
          citations?: Json | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string | null
          is_streaming?: boolean | null
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          provider_used?: string | null
          role?: string | null
          stream_completed_at?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tool_call_status?: string | null
          tool_calls?: string | null
          tool_results?: string | null
        }
        Relationships: []
      }
      ai_agent_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: string | null
          icon: string | null
          id: string | null
          is_active: string | null
          name: string | null
          slug: string | null
          sort_order: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: string | null
          icon?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: string | null
          icon?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_agent_runs: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          context: string | null
          created_at: string | null
          error: string | null
          error_message: string | null
          id: string | null
          input: string | null
          latency_ms: number | null
          metadata: Json | null
          model: string | null
          model_used: string | null
          output: string | null
          output_text: string | null
          provider_used: string | null
          run_type: string | null
          started_at: string | null
          status: string | null
          token_metrics: Json | null
          tokens_used: number | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          context?: string | null
          created_at?: string | null
          error?: string | null
          error_message?: string | null
          id?: string | null
          input?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          model?: string | null
          model_used?: string | null
          output?: string | null
          output_text?: string | null
          provider_used?: string | null
          run_type?: string | null
          started_at?: string | null
          status?: string | null
          token_metrics?: Json | null
          tokens_used?: number | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          context?: string | null
          created_at?: string | null
          error?: string | null
          error_message?: string | null
          id?: string | null
          input?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          model?: string | null
          model_used?: string | null
          output?: string | null
          output_text?: string | null
          provider_used?: string | null
          run_type?: string | null
          started_at?: string | null
          status?: string | null
          token_metrics?: Json | null
          tokens_used?: number | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          avatar: string | null
          category: string | null
          category_id: string | null
          conversation_starters: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          is_default: boolean | null
          is_enabled: boolean | null
          mcp_server_ids: Json | null
          memory_enabled: boolean | null
          metadata: Json | null
          model: string | null
          name: string | null
          slug: string | null
          system_prompt: string | null
          tool_code_interpreter: boolean | null
          tool_file_search: boolean | null
          tool_image_generation: boolean | null
          tool_mcp: boolean | null
          tool_web_search: boolean | null
          tools: Json | null
          tools_config: Json | null
          updated_at: string | null
          usage_count: number | null
          welcome_message: string | null
        }
        Insert: {
          avatar?: string | null
          category?: string | null
          category_id?: string | null
          conversation_starters?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          is_enabled?: boolean | null
          mcp_server_ids?: Json | null
          memory_enabled?: boolean | null
          metadata?: Json | null
          model?: string | null
          name?: string | null
          slug?: string | null
          system_prompt?: string | null
          tool_code_interpreter?: boolean | null
          tool_file_search?: boolean | null
          tool_image_generation?: boolean | null
          tool_mcp?: boolean | null
          tool_web_search?: boolean | null
          tools?: Json | null
          tools_config?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          welcome_message?: string | null
        }
        Update: {
          avatar?: string | null
          category?: string | null
          category_id?: string | null
          conversation_starters?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          is_enabled?: boolean | null
          mcp_server_ids?: Json | null
          memory_enabled?: boolean | null
          metadata?: Json | null
          model?: string | null
          name?: string | null
          slug?: string | null
          system_prompt?: string | null
          tool_code_interpreter?: boolean | null
          tool_file_search?: boolean | null
          tool_image_generation?: boolean | null
          tool_mcp?: boolean | null
          tool_web_search?: boolean | null
          tools?: Json | null
          tools_config?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          agent_id: string | null
          content: string | null
          created_at: string | null
          feedback: string | null
          id: string | null
          metadata: string | null
          model: string | null
          rating: string | null
          role: string | null
          session_id: string | null
          tokens_used: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string | null
          metadata?: string | null
          model?: string | null
          rating?: string | null
          role?: string | null
          session_id?: string | null
          tokens_used?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string | null
          metadata?: string | null
          model?: string | null
          rating?: string | null
          role?: string | null
          session_id?: string | null
          tokens_used?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_models: {
        Row: {
          category: string | null
          context_window: number | null
          created_at: string | null
          embedding_cost_per_1k: number | null
          enabled: boolean | null
          features: Json | null
          id: string | null
          input_cost_per_1k: number | null
          is_default: boolean | null
          max_tokens: string | null
          model_id: string | null
          name: string | null
          output_cost_per_1k: number | null
          provider_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          context_window?: number | null
          created_at?: string | null
          embedding_cost_per_1k?: number | null
          enabled?: boolean | null
          features?: Json | null
          id?: string | null
          input_cost_per_1k?: number | null
          is_default?: boolean | null
          max_tokens?: string | null
          model_id?: string | null
          name?: string | null
          output_cost_per_1k?: number | null
          provider_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          context_window?: number | null
          created_at?: string | null
          embedding_cost_per_1k?: number | null
          enabled?: boolean | null
          features?: Json | null
          id?: string | null
          input_cost_per_1k?: number | null
          is_default?: boolean | null
          max_tokens?: string | null
          model_id?: string | null
          name?: string | null
          output_cost_per_1k?: number | null
          provider_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_providers: {
        Row: {
          api_base_url: string | null
          api_key_secret_name: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          slug: string | null
        }
        Insert: {
          api_base_url?: string | null
          api_key_secret_name?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          slug?: string | null
        }
        Update: {
          api_base_url?: string | null
          api_key_secret_name?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          created_at: string | null
          embedding_tokens: number | null
          estimated_cost: number | null
          function_name: string | null
          id: string | null
          input_tokens: number | null
          model_id: string | null
          output_tokens: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          embedding_tokens?: number | null
          estimated_cost?: number | null
          function_name?: string | null
          id?: string | null
          input_tokens?: number | null
          model_id?: string | null
          output_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          embedding_tokens?: number | null
          estimated_cost?: number | null
          function_name?: string | null
          id?: string | null
          input_tokens?: number | null
          model_id?: string | null
          output_tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_sensitive: boolean | null
          key: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_sensitive?: boolean | null
          key?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_sensitive?: boolean | null
          key?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      app_modules: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          is_core: boolean | null
          name: string | null
          page_route: string | null
          requires_feature_flag: string | null
          slug: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          is_core?: boolean | null
          name?: string | null
          page_route?: string | null
          requires_feature_flag?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          is_core?: boolean | null
          name?: string | null
          page_route?: string | null
          requires_feature_flag?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string | null
          created_at: string | null
          created_by: string | null
          data_source: string | null
          email: string | null
          external_id: string | null
          external_url: string | null
          id: string | null
          last_synced_at: string | null
          metadata: string | null
          name: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          email?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string | null
          last_synced_at?: string | null
          metadata?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          email?: string | null
          external_id?: string | null
          external_url?: string | null
          id?: string | null
          last_synced_at?: string | null
          metadata?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          phone: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_sync_logs: {
        Row: {
          created_at: string | null
          direction: string | null
          entity_type: string | null
          id: string | null
          message: string | null
          organization_integration_id: string | null
          records_processed: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          direction?: string | null
          entity_type?: string | null
          id?: string | null
          message?: string | null
          organization_integration_id?: string | null
          records_processed?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string | null
          entity_type?: string | null
          id?: string | null
          message?: string | null
          organization_integration_id?: string | null
          records_processed?: string | null
          status?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          client_id: string | null
          closed_at: string | null
          contact_id: string | null
          created_at: string | null
          expected_close_date: string | null
          follow_up_status: string | null
          id: string | null
          last_contacted_at: string | null
          metadata: string | null
          notes: string | null
          owner_id: string | null
          probability: string | null
          source: string | null
          stage: string | null
          title: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          client_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          follow_up_status?: string | null
          id?: string | null
          last_contacted_at?: string | null
          metadata?: string | null
          notes?: string | null
          owner_id?: string | null
          probability?: string | null
          source?: string | null
          stage?: string | null
          title?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          client_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          follow_up_status?: string | null
          id?: string | null
          last_contacted_at?: string | null
          metadata?: string | null
          notes?: string | null
          owner_id?: string | null
          probability?: string | null
          source?: string | null
          stage?: string | null
          title?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_active: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string | null
          metadata: string | null
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string | null
          metadata?: string | null
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string | null
          metadata?: string | null
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: []
      }
      employee_pods: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string | null
          pod_id: string | null
          synced_from_hr: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string | null
          pod_id?: string | null
          synced_from_hr?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string | null
          pod_id?: string | null
          synced_from_hr?: string | null
        }
        Relationships: []
      }
      employee_profiles: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string | null
          employment_type: string | null
          full_name: string | null
          hire_date: string | null
          id: string | null
          is_active: string | null
          location: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          employment_type?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string | null
          is_active?: string | null
          location?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          employment_type?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string | null
          is_active?: string | null
          location?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string | null
          message: string | null
          metadata: string | null
          status: string | null
          subject: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          metadata?: string | null
          status?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          metadata?: string | null
          status?: string | null
          subject?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      follow_up_leads: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          id: string | null
          metadata: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          id?: string | null
          metadata?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          id?: string | null
          metadata?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: string | null
          enabled: string | null
          icon: string | null
          id: string | null
          name: string | null
          slug: string | null
          sort_order: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: string | null
          enabled?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: string | null
          enabled?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          slug?: string | null
          sort_order?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          display_order: string | null
          field_key: string | null
          field_type: string | null
          help_text: string | null
          id: string | null
          is_required: string | null
          is_sensitive: string | null
          label: string | null
          placeholder: string | null
          provider_id: string | null
          select_options: string | null
          validation_regex: string | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          display_order?: string | null
          field_key?: string | null
          field_type?: string | null
          help_text?: string | null
          id?: string | null
          is_required?: string | null
          is_sensitive?: string | null
          label?: string | null
          placeholder?: string | null
          provider_id?: string | null
          select_options?: string | null
          validation_regex?: string | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          display_order?: string | null
          field_key?: string | null
          field_type?: string | null
          help_text?: string | null
          id?: string | null
          is_required?: string | null
          is_sensitive?: string | null
          label?: string | null
          placeholder?: string | null
          provider_id?: string | null
          select_options?: string | null
          validation_regex?: string | null
        }
        Relationships: []
      }
      integration_providers: {
        Row: {
          auth_type: string | null
          category_id: string | null
          config: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          docs_url: string | null
          id: string | null
          is_active: boolean | null
          is_available: boolean | null
          is_beta: boolean | null
          is_coming_soon: boolean | null
          logo_url: string | null
          name: string | null
          oauth_config: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          auth_type?: string | null
          category_id?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          docs_url?: string | null
          id?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_beta?: boolean | null
          is_coming_soon?: boolean | null
          logo_url?: string | null
          name?: string | null
          oauth_config?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_type?: string | null
          category_id?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          docs_url?: string | null
          id?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_beta?: boolean | null
          is_coming_soon?: boolean | null
          logo_url?: string | null
          name?: string | null
          oauth_config?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_services: {
        Row: {
          cost_model: string | null
          created_at: string | null
          description: string | null
          display_order: string | null
          enabled: string | null
          features: string | null
          has_cost: string | null
          id: string | null
          is_default: string | null
          name: string | null
          provider_id: string | null
          requires_config: string | null
          service_key: string | null
          updated_at: string | null
        }
        Insert: {
          cost_model?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: string | null
          enabled?: string | null
          features?: string | null
          has_cost?: string | null
          id?: string | null
          is_default?: string | null
          name?: string | null
          provider_id?: string | null
          requires_config?: string | null
          service_key?: string | null
          updated_at?: string | null
        }
        Update: {
          cost_model?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: string | null
          enabled?: string | null
          features?: string | null
          has_cost?: string | null
          id?: string | null
          is_default?: string | null
          name?: string | null
          provider_id?: string | null
          requires_config?: string | null
          service_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_usage_logs: {
        Row: {
          action: string | null
          created_at: string | null
          error_message: string | null
          estimated_cost: string | null
          id: string | null
          organization_id: string | null
          provider_id: string | null
          request_metadata: string | null
          response_metadata: string | null
          service_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: string | null
          id?: string | null
          organization_id?: string | null
          provider_id?: string | null
          request_metadata?: string | null
          response_metadata?: string | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: string | null
          id?: string | null
          organization_id?: string | null
          provider_id?: string | null
          request_metadata?: string | null
          response_metadata?: string | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          parent_id: string | null
          slug: string | null
          sort_order: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: string | null
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string | null
          id: string | null
          metadata: string | null
          status: string | null
          tags: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: string | null
          status?: string | null
          tags?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: string | null
          status?: string | null
          tags?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_files: {
        Row: {
          category_id: string | null
          chunk_count: string | null
          created_at: string | null
          entry_id: string | null
          file_name: string | null
          file_size: string | null
          file_type: string | null
          id: string | null
          processed_at: string | null
          processing_error: string | null
          processing_status: string | null
          storage_path: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          chunk_count?: string | null
          created_at?: string | null
          entry_id?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          chunk_count?: string | null
          created_at?: string | null
          entry_id?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          config: string | null
          created_at: string | null
          id: string | null
          is_active: string | null
          last_sync_at: string | null
          name: string | null
          source_type: string | null
          updated_at: string | null
        }
        Insert: {
          config?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          last_sync_at?: string | null
          name?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          last_sync_at?: string | null
          name?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mcp_servers: {
        Row: {
          api_key: string | null
          config: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_active: string | null
          name: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          api_key?: string | null
          config?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          api_key?: string | null
          config?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      meeting_action_items: {
        Row: {
          assignee_email: string | null
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          extracted_from_transcript: string | null
          extraction_confidence: string | null
          id: string | null
          meeting_id: string | null
          priority: string | null
          status: string | null
          task_id: string | null
          text: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_email?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          extracted_from_transcript?: string | null
          extraction_confidence?: string | null
          id?: string | null
          meeting_id?: string | null
          priority?: string | null
          status?: string | null
          task_id?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_email?: string | null
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          extracted_from_transcript?: string | null
          extraction_confidence?: string | null
          id?: string | null
          meeting_id?: string | null
          priority?: string | null
          status?: string | null
          task_id?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_agenda_items: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: string | null
          id: string | null
          meeting_id: string | null
          presenter_id: string | null
          sort_order: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: string | null
          id?: string | null
          meeting_id?: string | null
          presenter_id?: string | null
          sort_order?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: string | null
          id?: string | null
          meeting_id?: string | null
          presenter_id?: string | null
          sort_order?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_attendees: {
        Row: {
          attended: string | null
          created_at: string | null
          email: string | null
          id: string | null
          meeting_id: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          attended?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          meeting_id?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          attended?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          meeting_id?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meeting_files: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: string | null
          file_type: string | null
          id: string | null
          meeting_id: string | null
          source: string | null
          storage_path: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          meeting_id?: string | null
          source?: string | null
          storage_path?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          meeting_id?: string | null
          source?: string | null
          storage_path?: string | null
        }
        Relationships: []
      }
      meeting_issues: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string | null
          meeting_id: string | null
          severity: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          meeting_id?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          meeting_id?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_participants: {
        Row: {
          attendance_status: string | null
          created_at: string | null
          email: string | null
          id: string | null
          meeting_id: string | null
          name: string | null
          role: string | null
          rsvp_status: string | null
          user_id: string | null
        }
        Insert: {
          attendance_status?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          meeting_id?: string | null
          name?: string | null
          role?: string | null
          rsvp_status?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_status?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          meeting_id?: string | null
          name?: string | null
          role?: string | null
          rsvp_status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meeting_rules: {
        Row: {
          actions: string | null
          conditions: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_active: string | null
          name: string | null
          rule_type: string | null
          updated_at: string | null
        }
        Insert: {
          actions?: string | null
          conditions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          rule_type?: string | null
          updated_at?: string | null
        }
        Update: {
          actions?: string | null
          conditions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          rule_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_series: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_active: string | null
          organizer_id: string | null
          recurrence_rule: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          organizer_id?: string | null
          recurrence_rule?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          organizer_id?: string | null
          recurrence_rule?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_summary_notes: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          meeting_id: string | null
          note_type: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          meeting_id?: string | null
          note_type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          meeting_id?: string | null
          note_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_takeaways: {
        Row: {
          assignee_id: string | null
          content: string | null
          created_at: string | null
          id: string | null
          meeting_id: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          assignee_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          meeting_id?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          assignee_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          meeting_id?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      meeting_templates: {
        Row: {
          agenda_template: string | null
          created_at: string | null
          created_by: string | null
          default_duration: string | null
          description: string | null
          id: string | null
          is_active: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          agenda_template?: string | null
          created_at?: string | null
          created_by?: string | null
          default_duration?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          agenda_template?: string | null
          created_at?: string | null
          created_by?: string | null
          default_duration?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_transcripts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          meeting_id: string | null
          source: string | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          meeting_id?: string | null
          source?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          meeting_id?: string | null
          source?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: string | null
          energy_level: string | null
          external_id: string | null
          external_meeting_id: string | null
          external_uuid: string | null
          host_url: string | null
          id: string | null
          is_recurring: string | null
          join_url: string | null
          location: string | null
          meeting_type: string | null
          metadata: string | null
          organizer_id: string | null
          project_id: string | null
          project_name: string | null
          provider: string | null
          scheduled_at: string | null
          sentiment_score: string | null
          series_id: string | null
          slug: string | null
          status: string | null
          tags: string | null
          title: string | null
          transcript_error: string | null
          transcript_status: string | null
          updated_at: string | null
          zoom_id: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_start_url: string | null
          zoom_uuid: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: string | null
          energy_level?: string | null
          external_id?: string | null
          external_meeting_id?: string | null
          external_uuid?: string | null
          host_url?: string | null
          id?: string | null
          is_recurring?: string | null
          join_url?: string | null
          location?: string | null
          meeting_type?: string | null
          metadata?: string | null
          organizer_id?: string | null
          project_id?: string | null
          project_name?: string | null
          provider?: string | null
          scheduled_at?: string | null
          sentiment_score?: string | null
          series_id?: string | null
          slug?: string | null
          status?: string | null
          tags?: string | null
          title?: string | null
          transcript_error?: string | null
          transcript_status?: string | null
          updated_at?: string | null
          zoom_id?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_url?: string | null
          zoom_uuid?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: string | null
          energy_level?: string | null
          external_id?: string | null
          external_meeting_id?: string | null
          external_uuid?: string | null
          host_url?: string | null
          id?: string | null
          is_recurring?: string | null
          join_url?: string | null
          location?: string | null
          meeting_type?: string | null
          metadata?: string | null
          organizer_id?: string | null
          project_id?: string | null
          project_name?: string | null
          provider?: string | null
          scheduled_at?: string | null
          sentiment_score?: string | null
          series_id?: string | null
          slug?: string | null
          status?: string | null
          tags?: string | null
          title?: string | null
          transcript_error?: string | null
          transcript_status?: string | null
          updated_at?: string | null
          zoom_id?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_url?: string | null
          zoom_uuid?: string | null
        }
        Relationships: []
      }
      nonprofit_campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          donor_count: number | null
          end_date: string | null
          fund_designation: string | null
          goal: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          raised: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_count?: number | null
          end_date?: string | null
          fund_designation?: string | null
          goal?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          raised?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_count?: number | null
          end_date?: string | null
          fund_designation?: string | null
          goal?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          raised?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_donations: {
        Row: {
          amount: number | null
          campaign_id: string | null
          created_at: string | null
          donor_email: string | null
          donor_name: string | null
          frequency: string | null
          fund_designation: string | null
          id: string | null
          is_anonymous: boolean | null
          notes: string | null
          payment_method: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string | null
          fund_designation?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string | null
          fund_designation?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_event_agenda_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          event_id: string | null
          id: string | null
          speaker_name: string | null
          time: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string | null
          speaker_name?: string | null
          time?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string | null
          speaker_name?: string | null
          time?: string | null
          title?: string | null
        }
        Relationships: []
      }
      nonprofit_event_registrants: {
        Row: {
          checked_in: boolean | null
          created_at: string | null
          email: string | null
          event_id: string | null
          id: string | null
          name: string | null
          registered_at: string | null
          ticket_tier: string | null
        }
        Insert: {
          checked_in?: boolean | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          id?: string | null
          name?: string | null
          registered_at?: string | null
          ticket_tier?: string | null
        }
        Update: {
          checked_in?: boolean | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          id?: string | null
          name?: string | null
          registered_at?: string | null
          ticket_tier?: string | null
        }
        Relationships: []
      }
      nonprofit_event_speakers: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          event_id: string | null
          id: string | null
          name: string | null
          title: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string | null
          name?: string | null
          title?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string | null
          name?: string | null
          title?: string | null
        }
        Relationships: []
      }
      nonprofit_event_ticket_types: {
        Row: {
          capacity: number | null
          created_at: string | null
          event_id: string | null
          id: string | null
          price: number | null
          sold: number | null
          tier: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string | null
          price?: number | null
          sold?: number | null
          tier?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string | null
          price?: number | null
          sold?: number | null
          tier?: string | null
        }
        Relationships: []
      }
      nonprofit_events: {
        Row: {
          capacity: number | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          fund_raised: number | null
          id: string | null
          location: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          fund_raised?: number | null
          id?: string | null
          location?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          fund_raised?: number | null
          id?: string | null
          location?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_members: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          employer: string | null
          id: string | null
          interests: string | null
          join_date: string | null
          name: string | null
          phone: string | null
          renewal_date: string | null
          status: string | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          employer?: string | null
          id?: string | null
          interests?: string | null
          join_date?: string | null
          name?: string | null
          phone?: string | null
          renewal_date?: string | null
          status?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          employer?: string | null
          id?: string | null
          interests?: string | null
          join_date?: string | null
          name?: string | null
          phone?: string | null
          renewal_date?: string | null
          status?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_programs: {
        Row: {
          beneficiary_count: number | null
          budget_total: number | null
          budget_used: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          lead_staff: string | null
          name: string | null
          outcomes_achieved: number | null
          outcomes_target: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          volunteer_hours: number | null
        }
        Insert: {
          beneficiary_count?: number | null
          budget_total?: number | null
          budget_used?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          lead_staff?: string | null
          name?: string | null
          outcomes_achieved?: number | null
          outcomes_target?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          volunteer_hours?: number | null
        }
        Update: {
          beneficiary_count?: number | null
          budget_total?: number | null
          budget_used?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          lead_staff?: string | null
          name?: string | null
          outcomes_achieved?: number | null
          outcomes_target?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          volunteer_hours?: number | null
        }
        Relationships: []
      }
      nonprofit_role_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string | null
          resource_key: string | null
          resource_type: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string | null
          resource_key?: string | null
          resource_type?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string | null
          resource_key?: string | null
          resource_type?: string | null
          role?: string | null
        }
        Relationships: []
      }
      nonprofit_volunteer_shifts: {
        Row: {
          created_at: string | null
          date: string | null
          event_name: string | null
          hours: number | null
          id: string | null
          status: string | null
          updated_at: string | null
          volunteer_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          event_name?: string | null
          hours?: number | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          volunteer_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          event_name?: string | null
          hours?: number | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          volunteer_id?: string | null
        }
        Relationships: []
      }
      nonprofit_volunteers: {
        Row: {
          availability: string | null
          created_at: string | null
          created_by: string | null
          donor_total_giving: number | null
          email: string | null
          id: string | null
          is_also_donor: boolean | null
          joined_date: string | null
          name: string | null
          phone: string | null
          skills: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          created_by?: string | null
          donor_total_giving?: number | null
          email?: string | null
          id?: string | null
          is_also_donor?: boolean | null
          joined_date?: string | null
          name?: string | null
          phone?: string | null
          skills?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          created_by?: string | null
          donor_total_giving?: number | null
          email?: string | null
          id?: string | null
          is_also_donor?: boolean | null
          joined_date?: string | null
          name?: string | null
          phone?: string | null
          skills?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string | null
          is_read: string | null
          link: string | null
          message: string | null
          metadata: string | null
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_read?: string | null
          link?: string | null
          message?: string | null
          metadata?: string | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_read?: string | null
          link?: string | null
          message?: string | null
          metadata?: string | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_integrations: {
        Row: {
          config: string | null
          connection_message: string | null
          connection_status: string | null
          created_at: string | null
          credentials: string | null
          enabled: string | null
          id: string | null
          is_primary: string | null
          last_sync_at: string | null
          last_tested_at: string | null
          oauth_tokens: string | null
          provider_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: string | null
          connection_message?: string | null
          connection_status?: string | null
          created_at?: string | null
          credentials?: string | null
          enabled?: string | null
          id?: string | null
          is_primary?: string | null
          last_sync_at?: string | null
          last_tested_at?: string | null
          oauth_tokens?: string | null
          provider_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: string | null
          connection_message?: string | null
          connection_status?: string | null
          created_at?: string | null
          credentials?: string | null
          enabled?: string | null
          id?: string | null
          is_primary?: string | null
          last_sync_at?: string | null
          last_tested_at?: string | null
          oauth_tokens?: string | null
          provider_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pod_employees: {
        Row: {
          created_at: string | null
          employee_id: string | null
          has_login: string | null
          id: string | null
          is_active: string | null
          pod_id: string | null
          synced_from_hr: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          has_login?: string | null
          id?: string | null
          is_active?: string | null
          pod_id?: string | null
          synced_from_hr?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          has_login?: string | null
          id?: string | null
          is_active?: string | null
          pod_id?: string | null
          synced_from_hr?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pod_members: {
        Row: {
          created_at: string | null
          id: string | null
          pod_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          pod_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          pod_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pod_permissions: {
        Row: {
          created_at: string | null
          has_access: string | null
          id: string | null
          module_id: string | null
          pod_id: string | null
        }
        Insert: {
          created_at?: string | null
          has_access?: string | null
          id?: string | null
          module_id?: string | null
          pod_id?: string | null
        }
        Update: {
          created_at?: string | null
          has_access?: string | null
          id?: string | null
          module_id?: string | null
          pod_id?: string | null
        }
        Relationships: []
      }
      pods: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string | null
          is_active: string | null
          name: string | null
          show_in_resource_projection: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          show_in_resource_projection?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string | null
          is_active?: string | null
          name?: string | null
          show_in_resource_projection?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      processing_queue_history: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error: string | null
          id: string | null
          input: string | null
          output: string | null
          queue_type: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string | null
          input?: string | null
          output?: string | null
          queue_type?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string | null
          input?: string | null
          output?: string | null
          queue_type?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          metadata: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_backups: {
        Row: {
          backup_data: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          project_id: string | null
        }
        Insert: {
          backup_data?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          project_id?: string | null
        }
        Update: {
          backup_data?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          project_id?: string | null
        }
        Relationships: []
      }
      project_billing: {
        Row: {
          billing_type: string | null
          created_at: string | null
          currency: string | null
          id: string | null
          invoiced_amount: string | null
          payment_terms: string | null
          project_id: string | null
          rate: string | null
          total_budget: string | null
          updated_at: string | null
        }
        Insert: {
          billing_type?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          invoiced_amount?: string | null
          payment_terms?: string | null
          project_id?: string | null
          rate?: string | null
          total_budget?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_type?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          invoiced_amount?: string | null
          payment_terms?: string | null
          project_id?: string | null
          rate?: string | null
          total_budget?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_checklists: {
        Row: {
          created_at: string | null
          id: string | null
          is_completed: string | null
          project_id: string | null
          sort_order: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_completed?: string | null
          project_id?: string | null
          sort_order?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_completed?: string | null
          project_id?: string | null
          sort_order?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_client_access: {
        Row: {
          access_level: string | null
          access_token: string | null
          can_approve: string | null
          can_comment: string | null
          can_upload: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string | null
          is_active: string | null
          last_accessed_at: string | null
          portal_sections: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          access_token?: string | null
          can_approve?: string | null
          can_comment?: string | null
          can_upload?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string | null
          is_active?: string | null
          last_accessed_at?: string | null
          portal_sections?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          access_token?: string | null
          can_approve?: string | null
          can_comment?: string | null
          can_upload?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string | null
          is_active?: string | null
          last_accessed_at?: string | null
          portal_sections?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          parent_id: string | null
          project_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          parent_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          parent_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_concerns: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          project_id: string | null
          raised_by: string | null
          severity: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          project_id?: string | null
          raised_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          project_id?: string | null
          raised_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: string | null
          file_type: string | null
          id: string | null
          project_id: string | null
          source: string | null
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          project_id?: string | null
          source?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          project_id?: string | null
          source?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      project_invoices: {
        Row: {
          amount: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string | null
          invoice_number: string | null
          notes: string | null
          paid_at: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string | null
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string | null
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string | null
          joined_at: string | null
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          joined_at?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          joined_at?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string | null
          project_id: string | null
          sort_order: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string | null
          project_id?: string | null
          sort_order?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string | null
          project_id?: string | null
          sort_order?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_risks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          mitigation: string | null
          project_id: string | null
          reported_by: string | null
          severity: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          mitigation?: string | null
          project_id?: string | null
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          mitigation?: string | null
          project_id?: string | null
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          is_default: boolean | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          external_id: string | null
          external_provider: string | null
          id: string | null
          is_archived: string | null
          metadata: string | null
          name: string | null
          owner_id: string | null
          slug: string | null
          source_deal_id: string | null
          start_date: string | null
          status_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          external_provider?: string | null
          id?: string | null
          is_archived?: string | null
          metadata?: string | null
          name?: string | null
          owner_id?: string | null
          slug?: string | null
          source_deal_id?: string | null
          start_date?: string | null
          status_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          external_provider?: string | null
          id?: string | null
          is_archived?: string | null
          metadata?: string | null
          name?: string | null
          owner_id?: string | null
          slug?: string | null
          source_deal_id?: string | null
          start_date?: string | null
          status_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          key: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          key?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: string | null
          file_type: string | null
          id: string | null
          task_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          task_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          task_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string | null
          meeting_id: string | null
          metadata: Json | null
          priority: string | null
          project_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string | null
          meeting_id?: string | null
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string | null
          meeting_id?: string | null
          metadata?: Json | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unified_documents: {
        Row: {
          content: string | null
          created_at: string | null
          file_name: string | null
          file_size: string | null
          file_type: string | null
          id: string | null
          metadata: string | null
          owner_id: string | null
          owner_type: string | null
          processing_status: string | null
          source_id: string | null
          source_type: string | null
          storage_path: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          metadata?: string | null
          owner_id?: string | null
          owner_type?: string | null
          processing_status?: string | null
          source_id?: string | null
          source_type?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          metadata?: string | null
          owner_id?: string | null
          owner_type?: string | null
          processing_status?: string | null
          source_id?: string | null
          source_type?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_agent_personalizations: {
        Row: {
          additional_prompt: string | null
          agent_id: string | null
          attached_knowledge_files: string | null
          created_at: string | null
          id: string | null
          is_enabled: string | null
          max_context_files: string | null
          relevance_threshold: string | null
          updated_at: string | null
          use_all_knowledge: string | null
          user_id: string | null
        }
        Insert: {
          additional_prompt?: string | null
          agent_id?: string | null
          attached_knowledge_files?: string | null
          created_at?: string | null
          id?: string | null
          is_enabled?: string | null
          max_context_files?: string | null
          relevance_threshold?: string | null
          updated_at?: string | null
          use_all_knowledge?: string | null
          user_id?: string | null
        }
        Update: {
          additional_prompt?: string | null
          agent_id?: string | null
          attached_knowledge_files?: string | null
          created_at?: string | null
          id?: string | null
          is_enabled?: string | null
          max_context_files?: string | null
          relevance_threshold?: string | null
          updated_at?: string | null
          use_all_knowledge?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_invites: {
        Row: {
          agency_role: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string | null
          invited_by: string | null
          org_id: string | null
          role: string | null
          token: string | null
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          agency_role?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string | null
          invited_by?: string | null
          org_id?: string | null
          role?: string | null
          token?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          agency_role?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string | null
          invited_by?: string | null
          org_id?: string | null
          role?: string | null
          token?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: []
      }
      user_knowledge_files: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: string | null
          file_type: string | null
          id: string | null
          processing_status: string | null
          storage_path: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          processing_status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          id?: string | null
          processing_status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_knowledge_sources: {
        Row: {
          config: string | null
          created_at: string | null
          id: string | null
          is_active: string | null
          last_sync_at: string | null
          name: string | null
          source_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          last_sync_at?: string | null
          name?: string | null
          source_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          last_sync_at?: string | null
          name?: string | null
          source_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_microsoft_teams: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: string | null
          team_id: string | null
          team_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          team_id?: string | null
          team_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          team_id?: string | null
          team_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_microsoft_teams_channels: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          created_at: string | null
          id: string | null
          is_active: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_module_permissions: {
        Row: {
          created_at: string | null
          has_access: string | null
          id: string | null
          module_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          has_access?: string | null
          id?: string | null
          module_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          has_access?: string | null
          id?: string | null
          module_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          agent_id: string | null
          confidence_score: string | null
          created_at: string | null
          evidence_count: string | null
          id: string | null
          is_active: string | null
          last_used_at: string | null
          learned_from: string | null
          preference_key: string | null
          preference_value: string | null
          times_used: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          confidence_score?: string | null
          created_at?: string | null
          evidence_count?: string | null
          id?: string | null
          is_active?: string | null
          last_used_at?: string | null
          learned_from?: string | null
          preference_key?: string | null
          preference_value?: string | null
          times_used?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          confidence_score?: string | null
          created_at?: string | null
          evidence_count?: string | null
          id?: string | null
          is_active?: string | null
          last_used_at?: string | null
          learned_from?: string | null
          preference_key?: string | null
          preference_value?: string | null
          times_used?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_role_preferences: {
        Row: {
          agency_role: string | null
          created_at: string | null
          id: string | null
          is_eos_user: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agency_role?: string | null
          created_at?: string | null
          id?: string | null
          is_eos_user?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agency_role?: string | null
          created_at?: string | null
          id?: string | null
          is_eos_user?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vector_search_logs: {
        Row: {
          created_at: string | null
          id: string | null
          latency_ms: string | null
          metadata: string | null
          query: string | null
          results_count: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          latency_ms?: string | null
          metadata?: string | null
          query?: string | null
          results_count?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          latency_ms?: string | null
          metadata?: string | null
          query?: string | null
          results_count?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      zoom_files: {
        Row: {
          created_at: string | null
          download_url: string | null
          file_name: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          has_embeddings: string | null
          id: string | null
          meeting_id: string | null
          processing_status: string | null
          recording_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          download_url?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          has_embeddings?: string | null
          id?: string | null
          meeting_id?: string | null
          processing_status?: string | null
          recording_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          download_url?: string | null
          file_name?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          has_embeddings?: string | null
          id?: string | null
          meeting_id?: string | null
          processing_status?: string | null
          recording_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
