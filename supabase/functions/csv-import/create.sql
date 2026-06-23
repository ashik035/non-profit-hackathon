DROP TABLE IF EXISTS public."activity_logs" CASCADE;
CREATE TABLE public."activity_logs" (
  "id" uuid,
  "user_id" uuid,
  "action" text,
  "resource_type" text,
  "resource_id" text,
  "details" jsonb,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamptz
);
GRANT SELECT ON public."activity_logs" TO anon, authenticated;
GRANT ALL ON public."activity_logs" TO service_role;
DROP TABLE IF EXISTS public."agent_conversations" CASCADE;
CREATE TABLE public."agent_conversations" (
  "id" uuid,
  "agent_id" uuid,
  "user_id" uuid,
  "title" text,
  "summary" text,
  "is_archived" boolean,
  "is_pinned" boolean,
  "message_count" bigint,
  "last_message_at" timestamptz,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."agent_conversations" TO anon, authenticated;
GRANT ALL ON public."agent_conversations" TO service_role;
DROP TABLE IF EXISTS public."agent_learning_events" CASCADE;
CREATE TABLE public."agent_learning_events" (
  "id" text,
  "agent_id" text,
  "user_id" text,
  "event_type" text,
  "event_description" text,
  "related_memory_id" text,
  "related_conversation_id" text,
  "related_message_id" text,
  "feedback_type" text,
  "feedback_text" text,
  "agent_action_taken" text,
  "behavior_change" text,
  "created_at" text
);
GRANT SELECT ON public."agent_learning_events" TO anon, authenticated;
GRANT ALL ON public."agent_learning_events" TO service_role;
DROP TABLE IF EXISTS public."agent_memories" CASCADE;
CREATE TABLE public."agent_memories" (
  "id" uuid,
  "agent_id" uuid,
  "user_id" uuid,
  "memory_type" text,
  "memory_category" text,
  "content" text,
  "summary" text,
  "embedding" text,
  "source_type" text,
  "source_id" uuid,
  "importance_score" numeric,
  "access_count" bigint,
  "last_accessed_at" timestamptz,
  "valid_from" timestamptz,
  "valid_until" text,
  "is_active" boolean,
  "consolidated" boolean,
  "superseded_by" text,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."agent_memories" TO anon, authenticated;
GRANT ALL ON public."agent_memories" TO service_role;
DROP TABLE IF EXISTS public."agent_messages" CASCADE;
CREATE TABLE public."agent_messages" (
  "id" uuid,
  "conversation_id" uuid,
  "role" text,
  "content" text,
  "model_used" text,
  "provider_used" text,
  "tokens_input" bigint,
  "tokens_output" bigint,
  "latency_ms" bigint,
  "tool_calls" text,
  "tool_results" text,
  "citations" jsonb,
  "metadata" jsonb,
  "created_at" timestamptz,
  "is_streaming" boolean,
  "stream_completed_at" text,
  "tool_call_status" text
);
GRANT SELECT ON public."agent_messages" TO anon, authenticated;
GRANT ALL ON public."agent_messages" TO service_role;
DROP TABLE IF EXISTS public."ai_agent_categories" CASCADE;
CREATE TABLE public."ai_agent_categories" (
  "id" text,
  "name" text,
  "slug" text,
  "description" text,
  "icon" text,
  "sort_order" text,
  "is_active" text,
  "created_at" text,
  "display_order" text,
  "updated_at" text
);
GRANT SELECT ON public."ai_agent_categories" TO anon, authenticated;
GRANT ALL ON public."ai_agent_categories" TO service_role;
DROP TABLE IF EXISTS public."ai_agent_runs" CASCADE;
CREATE TABLE public."ai_agent_runs" (
  "id" uuid,
  "agent_id" uuid,
  "user_id" uuid,
  "status" text,
  "input" text,
  "output" text,
  "error" text,
  "tokens_used" bigint,
  "started_at" timestamptz,
  "completed_at" text,
  "created_at" timestamptz,
  "error_message" text,
  "latency_ms" bigint,
  "context" text,
  "token_metrics" jsonb,
  "model" text,
  "trigger_type" text,
  "run_type" text,
  "metadata" jsonb,
  "provider_used" text,
  "model_used" text,
  "updated_at" timestamptz,
  "output_text" text
);
GRANT SELECT ON public."ai_agent_runs" TO anon, authenticated;
GRANT ALL ON public."ai_agent_runs" TO service_role;
DROP TABLE IF EXISTS public."ai_agents" CASCADE;
CREATE TABLE public."ai_agents" (
  "id" uuid,
  "name" text,
  "description" text,
  "system_prompt" text,
  "model" text,
  "tools" jsonb,
  "is_active" boolean,
  "created_by" text,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "category" text,
  "category_id" text,
  "is_enabled" boolean,
  "slug" text,
  "avatar" text,
  "memory_enabled" boolean,
  "welcome_message" text,
  "conversation_starters" jsonb,
  "is_default" boolean,
  "usage_count" bigint,
  "tool_code_interpreter" boolean,
  "tool_file_search" boolean,
  "tool_web_search" boolean,
  "tool_image_generation" boolean,
  "tool_mcp" boolean,
  "mcp_server_ids" jsonb,
  "tools_config" jsonb
);
GRANT SELECT ON public."ai_agents" TO anon, authenticated;
GRANT ALL ON public."ai_agents" TO service_role;
DROP TABLE IF EXISTS public."ai_chat_history" CASCADE;
CREATE TABLE public."ai_chat_history" (
  "id" text,
  "user_id" text,
  "agent_id" text,
  "session_id" text,
  "role" text,
  "content" text,
  "model" text,
  "tokens_used" text,
  "metadata" text,
  "created_at" text,
  "feedback" text,
  "rating" text
);
GRANT SELECT ON public."ai_chat_history" TO anon, authenticated;
GRANT ALL ON public."ai_chat_history" TO service_role;
DROP TABLE IF EXISTS public."ai_models" CASCADE;
CREATE TABLE public."ai_models" (
  "id" uuid,
  "name" text,
  "model_id" text,
  "provider_id" uuid,
  "category" text,
  "enabled" boolean,
  "is_default" boolean,
  "input_cost_per_1k" numeric,
  "output_cost_per_1k" numeric,
  "features" jsonb,
  "max_tokens" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "context_window" bigint,
  "embedding_cost_per_1k" numeric
);
GRANT SELECT ON public."ai_models" TO anon, authenticated;
GRANT ALL ON public."ai_models" TO service_role;
DROP TABLE IF EXISTS public."ai_providers" CASCADE;
CREATE TABLE public."ai_providers" (
  "id" uuid,
  "name" text,
  "slug" text,
  "api_base_url" text,
  "is_active" boolean,
  "created_at" timestamptz,
  "api_key_secret_name" text
);
GRANT SELECT ON public."ai_providers" TO anon, authenticated;
GRANT ALL ON public."ai_providers" TO service_role;
DROP TABLE IF EXISTS public."ai_usage_logs" CASCADE;
CREATE TABLE public."ai_usage_logs" (
  "id" uuid,
  "user_id" uuid,
  "model_id" uuid,
  "function_name" text,
  "input_tokens" bigint,
  "output_tokens" bigint,
  "embedding_tokens" bigint,
  "estimated_cost" numeric,
  "created_at" timestamptz
);
GRANT SELECT ON public."ai_usage_logs" TO anon, authenticated;
GRANT ALL ON public."ai_usage_logs" TO service_role;
DROP TABLE IF EXISTS public."app_config" CASCADE;
CREATE TABLE public."app_config" (
  "id" uuid,
  "key" text,
  "value" text,
  "category" text,
  "description" text,
  "is_sensitive" boolean,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."app_config" TO anon, authenticated;
GRANT ALL ON public."app_config" TO service_role;
DROP TABLE IF EXISTS public."app_modules" CASCADE;
CREATE TABLE public."app_modules" (
  "id" uuid,
  "name" text,
  "slug" text,
  "description" text,
  "page_route" text,
  "icon" text,
  "sort_order" bigint,
  "is_active" boolean,
  "is_core" boolean,
  "requires_feature_flag" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "category" text
);
GRANT SELECT ON public."app_modules" TO anon, authenticated;
GRANT ALL ON public."app_modules" TO service_role;
DROP TABLE IF EXISTS public."clients" CASCADE;
CREATE TABLE public."clients" (
  "id" text,
  "name" text,
  "email" text,
  "company" text,
  "phone" text,
  "status" text,
  "metadata" text,
  "created_by" text,
  "data_source" text,
  "external_id" text,
  "external_url" text,
  "last_synced_at" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."clients" TO anon, authenticated;
GRANT ALL ON public."clients" TO service_role;
DROP TABLE IF EXISTS public."contacts" CASCADE;
CREATE TABLE public."contacts" (
  "id" text,
  "first_name" text,
  "last_name" text,
  "email" text,
  "phone" text,
  "title" text,
  "client_id" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."contacts" TO anon, authenticated;
GRANT ALL ON public."contacts" TO service_role;
DROP TABLE IF EXISTS public."crm_sync_logs" CASCADE;
CREATE TABLE public."crm_sync_logs" (
  "id" text,
  "organization_integration_id" text,
  "direction" text,
  "entity_type" text,
  "status" text,
  "message" text,
  "records_processed" text,
  "created_at" text
);
GRANT SELECT ON public."crm_sync_logs" TO anon, authenticated;
GRANT ALL ON public."crm_sync_logs" TO service_role;
DROP TABLE IF EXISTS public."deals" CASCADE;
CREATE TABLE public."deals" (
  "id" text,
  "title" text,
  "value" text,
  "stage" text,
  "probability" text,
  "client_id" text,
  "contact_id" text,
  "owner_id" text,
  "notes" text,
  "expected_close_date" text,
  "metadata" text,
  "created_at" text,
  "updated_at" text,
  "closed_at" text,
  "last_contacted_at" text,
  "follow_up_status" text,
  "source" text
);
GRANT SELECT ON public."deals" TO anon, authenticated;
GRANT ALL ON public."deals" TO service_role;
DROP TABLE IF EXISTS public."departments" CASCADE;
CREATE TABLE public."departments" (
  "id" text,
  "name" text,
  "description" text,
  "is_active" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."departments" TO anon, authenticated;
GRANT ALL ON public."departments" TO service_role;
DROP TABLE IF EXISTS public."embeddings" CASCADE;
CREATE TABLE public."embeddings" (
  "id" text,
  "content" text,
  "embedding" text,
  "source_type" text,
  "source_id" text,
  "metadata" text,
  "created_at" text
);
GRANT SELECT ON public."embeddings" TO anon, authenticated;
GRANT ALL ON public."embeddings" TO service_role;
DROP TABLE IF EXISTS public."employee_pods" CASCADE;
CREATE TABLE public."employee_pods" (
  "id" text,
  "pod_id" text,
  "employee_id" text,
  "synced_from_hr" text,
  "created_at" text
);
GRANT SELECT ON public."employee_pods" TO anon, authenticated;
GRANT ALL ON public."employee_pods" TO service_role;
DROP TABLE IF EXISTS public."employee_profiles" CASCADE;
CREATE TABLE public."employee_profiles" (
  "id" text,
  "user_id" text,
  "email" text,
  "full_name" text,
  "department_id" text,
  "title" text,
  "employment_type" text,
  "is_active" text,
  "hire_date" text,
  "location" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."employee_profiles" TO anon, authenticated;
GRANT ALL ON public."employee_profiles" TO service_role;
DROP TABLE IF EXISTS public."feedback" CASCADE;
CREATE TABLE public."feedback" (
  "id" text,
  "user_id" text,
  "type" text,
  "subject" text,
  "message" text,
  "status" text,
  "metadata" text,
  "created_at" text
);
GRANT SELECT ON public."feedback" TO anon, authenticated;
GRANT ALL ON public."feedback" TO service_role;
DROP TABLE IF EXISTS public."follow_up_leads" CASCADE;
CREATE TABLE public."follow_up_leads" (
  "id" text,
  "deal_id" text,
  "contact_id" text,
  "status" text,
  "priority" text,
  "next_action" text,
  "next_action_date" text,
  "notes" text,
  "assigned_to" text,
  "created_by" text,
  "metadata" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."follow_up_leads" TO anon, authenticated;
GRANT ALL ON public."follow_up_leads" TO service_role;
DROP TABLE IF EXISTS public."integration_categories" CASCADE;
CREATE TABLE public."integration_categories" (
  "id" text,
  "name" text,
  "slug" text,
  "description" text,
  "sort_order" text,
  "created_at" text,
  "enabled" text,
  "display_order" text,
  "icon" text,
  "updated_at" text
);
GRANT SELECT ON public."integration_categories" TO anon, authenticated;
GRANT ALL ON public."integration_categories" TO service_role;
DROP TABLE IF EXISTS public."integration_fields" CASCADE;
CREATE TABLE public."integration_fields" (
  "id" text,
  "provider_id" text,
  "field_key" text,
  "label" text,
  "field_type" text,
  "placeholder" text,
  "default_value" text,
  "is_required" text,
  "is_sensitive" text,
  "help_text" text,
  "validation_regex" text,
  "select_options" text,
  "display_order" text,
  "created_at" text
);
GRANT SELECT ON public."integration_fields" TO anon, authenticated;
GRANT ALL ON public."integration_fields" TO service_role;
DROP TABLE IF EXISTS public."integration_providers" CASCADE;
CREATE TABLE public."integration_providers" (
  "id" uuid,
  "name" text,
  "slug" text,
  "description" text,
  "logo_url" text,
  "category_id" text,
  "auth_type" text,
  "config" jsonb,
  "is_active" boolean,
  "display_order" bigint,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "oauth_config" jsonb,
  "docs_url" text,
  "is_available" boolean,
  "is_coming_soon" boolean,
  "is_beta" boolean
);
GRANT SELECT ON public."integration_providers" TO anon, authenticated;
GRANT ALL ON public."integration_providers" TO service_role;
DROP TABLE IF EXISTS public."integration_services" CASCADE;
CREATE TABLE public."integration_services" (
  "id" text,
  "provider_id" text,
  "name" text,
  "service_key" text,
  "description" text,
  "features" text,
  "has_cost" text,
  "cost_model" text,
  "enabled" text,
  "is_default" text,
  "requires_config" text,
  "display_order" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."integration_services" TO anon, authenticated;
GRANT ALL ON public."integration_services" TO service_role;
DROP TABLE IF EXISTS public."integration_usage_logs" CASCADE;
CREATE TABLE public."integration_usage_logs" (
  "id" text,
  "organization_id" text,
  "provider_id" text,
  "service_id" text,
  "user_id" text,
  "action" text,
  "status" text,
  "request_metadata" text,
  "response_metadata" text,
  "error_message" text,
  "estimated_cost" text,
  "created_at" text
);
GRANT SELECT ON public."integration_usage_logs" TO anon, authenticated;
GRANT ALL ON public."integration_usage_logs" TO service_role;
DROP TABLE IF EXISTS public."knowledge_categories" CASCADE;
CREATE TABLE public."knowledge_categories" (
  "id" text,
  "name" text,
  "slug" text,
  "description" text,
  "parent_id" text,
  "sort_order" text,
  "created_at" text
);
GRANT SELECT ON public."knowledge_categories" TO anon, authenticated;
GRANT ALL ON public."knowledge_categories" TO service_role;
DROP TABLE IF EXISTS public."knowledge_entries" CASCADE;
CREATE TABLE public."knowledge_entries" (
  "id" text,
  "title" text,
  "content" text,
  "category_id" text,
  "user_id" text,
  "status" text,
  "tags" text,
  "metadata" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."knowledge_entries" TO anon, authenticated;
GRANT ALL ON public."knowledge_entries" TO service_role;
DROP TABLE IF EXISTS public."knowledge_files" CASCADE;
CREATE TABLE public."knowledge_files" (
  "id" text,
  "entry_id" text,
  "file_name" text,
  "file_type" text,
  "file_size" text,
  "storage_path" text,
  "processing_status" text,
  "created_at" text,
  "title" text,
  "category_id" text,
  "processing_error" text,
  "chunk_count" text,
  "processed_at" text,
  "updated_at" text
);
GRANT SELECT ON public."knowledge_files" TO anon, authenticated;
GRANT ALL ON public."knowledge_files" TO service_role;
DROP TABLE IF EXISTS public."knowledge_sources" CASCADE;
CREATE TABLE public."knowledge_sources" (
  "id" text,
  "name" text,
  "source_type" text,
  "config" text,
  "is_active" text,
  "last_sync_at" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."knowledge_sources" TO anon, authenticated;
GRANT ALL ON public."knowledge_sources" TO service_role;
DROP TABLE IF EXISTS public."mcp_servers" CASCADE;
CREATE TABLE public."mcp_servers" (
  "id" text,
  "name" text,
  "url" text,
  "api_key" text,
  "description" text,
  "is_active" text,
  "config" text,
  "created_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."mcp_servers" TO anon, authenticated;
GRANT ALL ON public."mcp_servers" TO service_role;
DROP TABLE IF EXISTS public."meeting_action_items" CASCADE;
CREATE TABLE public."meeting_action_items" (
  "id" text,
  "meeting_id" text,
  "title" text,
  "description" text,
  "assignee_id" text,
  "status" text,
  "due_date" text,
  "priority" text,
  "created_at" text,
  "updated_at" text,
  "text" text,
  "assignee_email" text,
  "task_id" text,
  "extraction_confidence" text,
  "extracted_from_transcript" text
);
GRANT SELECT ON public."meeting_action_items" TO anon, authenticated;
GRANT ALL ON public."meeting_action_items" TO service_role;
DROP TABLE IF EXISTS public."meeting_agenda_items" CASCADE;
CREATE TABLE public."meeting_agenda_items" (
  "id" text,
  "meeting_id" text,
  "title" text,
  "description" text,
  "duration_minutes" text,
  "sort_order" text,
  "presenter_id" text,
  "status" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_agenda_items" TO anon, authenticated;
GRANT ALL ON public."meeting_agenda_items" TO service_role;
DROP TABLE IF EXISTS public."meeting_attendees" CASCADE;
CREATE TABLE public."meeting_attendees" (
  "id" text,
  "meeting_id" text,
  "user_id" text,
  "email" text,
  "name" text,
  "attended" text,
  "created_at" text
);
GRANT SELECT ON public."meeting_attendees" TO anon, authenticated;
GRANT ALL ON public."meeting_attendees" TO service_role;
DROP TABLE IF EXISTS public."meeting_files" CASCADE;
CREATE TABLE public."meeting_files" (
  "id" text,
  "meeting_id" text,
  "file_name" text,
  "file_type" text,
  "file_size" text,
  "storage_path" text,
  "source" text,
  "created_at" text
);
GRANT SELECT ON public."meeting_files" TO anon, authenticated;
GRANT ALL ON public."meeting_files" TO service_role;
DROP TABLE IF EXISTS public."meeting_issues" CASCADE;
CREATE TABLE public."meeting_issues" (
  "id" text,
  "meeting_id" text,
  "title" text,
  "description" text,
  "severity" text,
  "status" text,
  "assigned_to" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_issues" TO anon, authenticated;
GRANT ALL ON public."meeting_issues" TO service_role;
DROP TABLE IF EXISTS public."meeting_participants" CASCADE;
CREATE TABLE public."meeting_participants" (
  "id" text,
  "meeting_id" text,
  "user_id" text,
  "email" text,
  "name" text,
  "role" text,
  "rsvp_status" text,
  "created_at" text,
  "attendance_status" text
);
GRANT SELECT ON public."meeting_participants" TO anon, authenticated;
GRANT ALL ON public."meeting_participants" TO service_role;
DROP TABLE IF EXISTS public."meeting_rules" CASCADE;
CREATE TABLE public."meeting_rules" (
  "id" text,
  "name" text,
  "description" text,
  "rule_type" text,
  "conditions" text,
  "actions" text,
  "is_active" text,
  "created_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_rules" TO anon, authenticated;
GRANT ALL ON public."meeting_rules" TO service_role;
DROP TABLE IF EXISTS public."meeting_series" CASCADE;
CREATE TABLE public."meeting_series" (
  "id" text,
  "title" text,
  "description" text,
  "recurrence_rule" text,
  "organizer_id" text,
  "is_active" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_series" TO anon, authenticated;
GRANT ALL ON public."meeting_series" TO service_role;
DROP TABLE IF EXISTS public."meeting_summary_notes" CASCADE;
CREATE TABLE public."meeting_summary_notes" (
  "id" text,
  "meeting_id" text,
  "content" text,
  "note_type" text,
  "created_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_summary_notes" TO anon, authenticated;
GRANT ALL ON public."meeting_summary_notes" TO service_role;
DROP TABLE IF EXISTS public."meeting_takeaways" CASCADE;
CREATE TABLE public."meeting_takeaways" (
  "id" text,
  "meeting_id" text,
  "content" text,
  "type" text,
  "assignee_id" text,
  "status" text,
  "created_at" text
);
GRANT SELECT ON public."meeting_takeaways" TO anon, authenticated;
GRANT ALL ON public."meeting_takeaways" TO service_role;
DROP TABLE IF EXISTS public."meeting_templates" CASCADE;
CREATE TABLE public."meeting_templates" (
  "id" text,
  "name" text,
  "description" text,
  "default_duration" text,
  "agenda_template" text,
  "created_by" text,
  "is_active" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_templates" TO anon, authenticated;
GRANT ALL ON public."meeting_templates" TO service_role;
DROP TABLE IF EXISTS public."meeting_transcripts" CASCADE;
CREATE TABLE public."meeting_transcripts" (
  "id" text,
  "meeting_id" text,
  "content" text,
  "summary" text,
  "source" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."meeting_transcripts" TO anon, authenticated;
GRANT ALL ON public."meeting_transcripts" TO service_role;
DROP TABLE IF EXISTS public."meetings" CASCADE;
CREATE TABLE public."meetings" (
  "id" text,
  "title" text,
  "description" text,
  "slug" text,
  "scheduled_at" text,
  "duration_minutes" text,
  "status" text,
  "meeting_type" text,
  "provider" text,
  "location" text,
  "join_url" text,
  "host_url" text,
  "external_id" text,
  "external_meeting_id" text,
  "external_uuid" text,
  "zoom_meeting_id" text,
  "zoom_join_url" text,
  "zoom_start_url" text,
  "zoom_uuid" text,
  "zoom_id" text,
  "client_id" text,
  "organizer_id" text,
  "project_id" text,
  "series_id" text,
  "is_recurring" text,
  "metadata" text,
  "created_at" text,
  "updated_at" text,
  "category" text,
  "tags" text,
  "sentiment_score" text,
  "energy_level" text,
  "project_name" text,
  "transcript_status" text,
  "transcript_error" text
);
GRANT SELECT ON public."meetings" TO anon, authenticated;
GRANT ALL ON public."meetings" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_campaigns" CASCADE;
CREATE TABLE public."nonprofit_campaigns" (
  "id" uuid,
  "created_by" uuid,
  "name" text,
  "description" text,
  "goal" numeric,
  "raised" numeric,
  "donor_count" bigint,
  "start_date" date,
  "end_date" date,
  "is_active" boolean,
  "fund_designation" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_campaigns" TO anon, authenticated;
GRANT ALL ON public."nonprofit_campaigns" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_donations" CASCADE;
CREATE TABLE public."nonprofit_donations" (
  "id" uuid,
  "campaign_id" uuid,
  "donor_name" text,
  "donor_email" text,
  "amount" bigint,
  "frequency" text,
  "fund_designation" text,
  "is_anonymous" boolean,
  "payment_method" text,
  "notes" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_donations" TO anon, authenticated;
GRANT ALL ON public."nonprofit_donations" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_event_agenda_items" CASCADE;
CREATE TABLE public."nonprofit_event_agenda_items" (
  "id" uuid,
  "event_id" uuid,
  "time" text,
  "title" text,
  "speaker_name" text,
  "display_order" bigint,
  "created_at" timestamptz
);
GRANT SELECT ON public."nonprofit_event_agenda_items" TO anon, authenticated;
GRANT ALL ON public."nonprofit_event_agenda_items" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_event_registrants" CASCADE;
CREATE TABLE public."nonprofit_event_registrants" (
  "id" uuid,
  "event_id" uuid,
  "name" text,
  "email" text,
  "ticket_tier" text,
  "checked_in" boolean,
  "registered_at" timestamptz,
  "created_at" timestamptz
);
GRANT SELECT ON public."nonprofit_event_registrants" TO anon, authenticated;
GRANT ALL ON public."nonprofit_event_registrants" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_event_speakers" CASCADE;
CREATE TABLE public."nonprofit_event_speakers" (
  "id" uuid,
  "event_id" uuid,
  "name" text,
  "title" text,
  "bio" text,
  "display_order" bigint,
  "created_at" timestamptz
);
GRANT SELECT ON public."nonprofit_event_speakers" TO anon, authenticated;
GRANT ALL ON public."nonprofit_event_speakers" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_event_ticket_types" CASCADE;
CREATE TABLE public."nonprofit_event_ticket_types" (
  "id" uuid,
  "event_id" uuid,
  "tier" text,
  "price" bigint,
  "capacity" bigint,
  "sold" bigint,
  "created_at" timestamptz
);
GRANT SELECT ON public."nonprofit_event_ticket_types" TO anon, authenticated;
GRANT ALL ON public."nonprofit_event_ticket_types" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_events" CASCADE;
CREATE TABLE public."nonprofit_events" (
  "id" uuid,
  "created_by" uuid,
  "title" text,
  "status" text,
  "date" date,
  "location" text,
  "description" text,
  "capacity" bigint,
  "fund_raised" numeric,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_events" TO anon, authenticated;
GRANT ALL ON public."nonprofit_events" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_members" CASCADE;
CREATE TABLE public."nonprofit_members" (
  "id" uuid,
  "created_by" uuid,
  "name" text,
  "email" text,
  "phone" text,
  "tier" text,
  "status" text,
  "join_date" date,
  "renewal_date" date,
  "employer" text,
  "interests" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_members" TO anon, authenticated;
GRANT ALL ON public."nonprofit_members" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_programs" CASCADE;
CREATE TABLE public."nonprofit_programs" (
  "id" uuid,
  "created_by" uuid,
  "name" text,
  "description" text,
  "start_date" date,
  "status" text,
  "lead_staff" text,
  "beneficiary_count" bigint,
  "volunteer_hours" bigint,
  "budget_used" bigint,
  "budget_total" bigint,
  "outcomes_achieved" bigint,
  "outcomes_target" bigint,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_programs" TO anon, authenticated;
GRANT ALL ON public."nonprofit_programs" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_role_permissions" CASCADE;
CREATE TABLE public."nonprofit_role_permissions" (
  "id" uuid,
  "role" text,
  "resource_type" text,
  "resource_key" text,
  "granted" boolean,
  "created_at" timestamptz
);
GRANT SELECT ON public."nonprofit_role_permissions" TO anon, authenticated;
GRANT ALL ON public."nonprofit_role_permissions" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_volunteer_shifts" CASCADE;
CREATE TABLE public."nonprofit_volunteer_shifts" (
  "id" uuid,
  "volunteer_id" uuid,
  "event_name" text,
  "date" date,
  "hours" numeric,
  "status" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_volunteer_shifts" TO anon, authenticated;
GRANT ALL ON public."nonprofit_volunteer_shifts" TO service_role;
DROP TABLE IF EXISTS public."nonprofit_volunteers" CASCADE;
CREATE TABLE public."nonprofit_volunteers" (
  "id" uuid,
  "created_by" uuid,
  "name" text,
  "email" text,
  "phone" text,
  "skills" text,
  "availability" text,
  "total_hours" numeric,
  "joined_date" date,
  "is_also_donor" boolean,
  "donor_total_giving" numeric,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."nonprofit_volunteers" TO anon, authenticated;
GRANT ALL ON public."nonprofit_volunteers" TO service_role;
DROP TABLE IF EXISTS public."notifications" CASCADE;
CREATE TABLE public."notifications" (
  "id" text,
  "user_id" text,
  "title" text,
  "message" text,
  "type" text,
  "is_read" text,
  "read_at" text,
  "link" text,
  "metadata" text,
  "created_at" text
);
GRANT SELECT ON public."notifications" TO anon, authenticated;
GRANT ALL ON public."notifications" TO service_role;
DROP TABLE IF EXISTS public."organization_integrations" CASCADE;
CREATE TABLE public."organization_integrations" (
  "id" text,
  "user_id" text,
  "provider_id" text,
  "connection_status" text,
  "config" text,
  "credentials" text,
  "last_sync_at" text,
  "created_at" text,
  "updated_at" text,
  "enabled" text,
  "connection_message" text,
  "last_tested_at" text,
  "oauth_tokens" text,
  "is_primary" text
);
GRANT SELECT ON public."organization_integrations" TO anon, authenticated;
GRANT ALL ON public."organization_integrations" TO service_role;
DROP TABLE IF EXISTS public."pod_employees" CASCADE;
CREATE TABLE public."pod_employees" (
  "id" text,
  "pod_id" text,
  "employee_id" text,
  "user_id" text,
  "has_login" text,
  "is_active" text,
  "synced_from_hr" text,
  "created_at" text
);
GRANT SELECT ON public."pod_employees" TO anon, authenticated;
GRANT ALL ON public."pod_employees" TO service_role;
DROP TABLE IF EXISTS public."pod_members" CASCADE;
CREATE TABLE public."pod_members" (
  "id" text,
  "pod_id" text,
  "user_id" text,
  "role" text,
  "created_at" text
);
GRANT SELECT ON public."pod_members" TO anon, authenticated;
GRANT ALL ON public."pod_members" TO service_role;
DROP TABLE IF EXISTS public."pod_permissions" CASCADE;
CREATE TABLE public."pod_permissions" (
  "id" text,
  "pod_id" text,
  "module_id" text,
  "has_access" text,
  "created_at" text
);
GRANT SELECT ON public."pod_permissions" TO anon, authenticated;
GRANT ALL ON public."pod_permissions" TO service_role;
DROP TABLE IF EXISTS public."pods" CASCADE;
CREATE TABLE public."pods" (
  "id" text,
  "name" text,
  "description" text,
  "color" text,
  "department_id" text,
  "is_active" text,
  "created_at" text,
  "updated_at" text,
  "show_in_resource_projection" text,
  "created_by" text
);
GRANT SELECT ON public."pods" TO anon, authenticated;
GRANT ALL ON public."pods" TO service_role;
DROP TABLE IF EXISTS public."processing_queue_history" CASCADE;
CREATE TABLE public."processing_queue_history" (
  "id" text,
  "queue_type" text,
  "status" text,
  "input" text,
  "output" text,
  "error" text,
  "started_at" text,
  "completed_at" text,
  "created_at" text
);
GRANT SELECT ON public."processing_queue_history" TO anon, authenticated;
GRANT ALL ON public."processing_queue_history" TO service_role;
DROP TABLE IF EXISTS public."profiles" CASCADE;
CREATE TABLE public."profiles" (
  "id" uuid,
  "full_name" text,
  "email" text,
  "avatar_url" text,
  "role" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "metadata" jsonb
);
GRANT SELECT ON public."profiles" TO anon, authenticated;
GRANT ALL ON public."profiles" TO service_role;
DROP TABLE IF EXISTS public."project_backups" CASCADE;
CREATE TABLE public."project_backups" (
  "id" text,
  "project_id" text,
  "backup_data" text,
  "created_by" text,
  "created_at" text
);
GRANT SELECT ON public."project_backups" TO anon, authenticated;
GRANT ALL ON public."project_backups" TO service_role;
DROP TABLE IF EXISTS public."project_billing" CASCADE;
CREATE TABLE public."project_billing" (
  "id" text,
  "project_id" text,
  "billing_type" text,
  "rate" text,
  "total_budget" text,
  "invoiced_amount" text,
  "currency" text,
  "payment_terms" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_billing" TO anon, authenticated;
GRANT ALL ON public."project_billing" TO service_role;
DROP TABLE IF EXISTS public."project_checklists" CASCADE;
CREATE TABLE public."project_checklists" (
  "id" text,
  "project_id" text,
  "title" text,
  "is_completed" text,
  "sort_order" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_checklists" TO anon, authenticated;
GRANT ALL ON public."project_checklists" TO service_role;
DROP TABLE IF EXISTS public."project_client_access" CASCADE;
CREATE TABLE public."project_client_access" (
  "id" text,
  "project_id" text,
  "client_id" text,
  "access_level" text,
  "granted_by" text,
  "created_at" text,
  "client_email" text,
  "client_name" text,
  "access_token" text,
  "is_active" text,
  "expires_at" text,
  "last_accessed_at" text,
  "updated_at" text,
  "portal_sections" text,
  "can_comment" text,
  "can_upload" text,
  "can_approve" text
);
GRANT SELECT ON public."project_client_access" TO anon, authenticated;
GRANT ALL ON public."project_client_access" TO service_role;
DROP TABLE IF EXISTS public."project_comments" CASCADE;
CREATE TABLE public."project_comments" (
  "id" text,
  "project_id" text,
  "user_id" text,
  "content" text,
  "parent_id" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_comments" TO anon, authenticated;
GRANT ALL ON public."project_comments" TO service_role;
DROP TABLE IF EXISTS public."project_concerns" CASCADE;
CREATE TABLE public."project_concerns" (
  "id" text,
  "project_id" text,
  "title" text,
  "description" text,
  "severity" text,
  "status" text,
  "raised_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_concerns" TO anon, authenticated;
GRANT ALL ON public."project_concerns" TO service_role;
DROP TABLE IF EXISTS public."project_files" CASCADE;
CREATE TABLE public."project_files" (
  "id" text,
  "project_id" text,
  "file_name" text,
  "file_type" text,
  "file_size" text,
  "storage_path" text,
  "source" text,
  "uploaded_by" text,
  "created_at" text
);
GRANT SELECT ON public."project_files" TO anon, authenticated;
GRANT ALL ON public."project_files" TO service_role;
DROP TABLE IF EXISTS public."project_invoices" CASCADE;
CREATE TABLE public."project_invoices" (
  "id" text,
  "project_id" text,
  "invoice_number" text,
  "amount" text,
  "status" text,
  "due_date" text,
  "paid_at" text,
  "notes" text,
  "created_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_invoices" TO anon, authenticated;
GRANT ALL ON public."project_invoices" TO service_role;
DROP TABLE IF EXISTS public."project_members" CASCADE;
CREATE TABLE public."project_members" (
  "id" text,
  "project_id" text,
  "user_id" text,
  "role" text,
  "joined_at" text
);
GRANT SELECT ON public."project_members" TO anon, authenticated;
GRANT ALL ON public."project_members" TO service_role;
DROP TABLE IF EXISTS public."project_milestones" CASCADE;
CREATE TABLE public."project_milestones" (
  "id" text,
  "project_id" text,
  "title" text,
  "description" text,
  "due_date" text,
  "status" text,
  "completed_at" text,
  "sort_order" text,
  "created_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_milestones" TO anon, authenticated;
GRANT ALL ON public."project_milestones" TO service_role;
DROP TABLE IF EXISTS public."project_risks" CASCADE;
CREATE TABLE public."project_risks" (
  "id" text,
  "project_id" text,
  "title" text,
  "description" text,
  "severity" text,
  "status" text,
  "mitigation" text,
  "reported_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."project_risks" TO anon, authenticated;
GRANT ALL ON public."project_risks" TO service_role;
DROP TABLE IF EXISTS public."project_statuses" CASCADE;
CREATE TABLE public."project_statuses" (
  "id" uuid,
  "name" text,
  "slug" text,
  "color" text,
  "sort_order" bigint,
  "is_active" boolean,
  "is_default" boolean,
  "created_at" timestamptz
);
GRANT SELECT ON public."project_statuses" TO anon, authenticated;
GRANT ALL ON public."project_statuses" TO service_role;
DROP TABLE IF EXISTS public."projects" CASCADE;
CREATE TABLE public."projects" (
  "id" text,
  "name" text,
  "slug" text,
  "description" text,
  "status_id" text,
  "client_id" text,
  "source_deal_id" text,
  "owner_id" text,
  "start_date" text,
  "end_date" text,
  "budget" text,
  "currency" text,
  "is_archived" text,
  "external_id" text,
  "external_provider" text,
  "metadata" text,
  "created_by" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."projects" TO anon, authenticated;
GRANT ALL ON public."projects" TO service_role;
DROP TABLE IF EXISTS public."support_tickets" CASCADE;
CREATE TABLE public."support_tickets" (
  "id" text,
  "created_at" text,
  "updated_at" text,
  "user_id" text,
  "user_email" text,
  "subject" text,
  "category" text,
  "description" text,
  "status" text,
  "admin_notes" text
);
GRANT SELECT ON public."support_tickets" TO anon, authenticated;
GRANT ALL ON public."support_tickets" TO service_role;
DROP TABLE IF EXISTS public."system_settings" CASCADE;
CREATE TABLE public."system_settings" (
  "id" uuid,
  "key" text,
  "value" text,
  "description" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."system_settings" TO anon, authenticated;
GRANT ALL ON public."system_settings" TO service_role;
DROP TABLE IF EXISTS public."task_attachments" CASCADE;
CREATE TABLE public."task_attachments" (
  "id" text,
  "task_id" text,
  "file_name" text,
  "file_path" text,
  "file_size" text,
  "file_type" text,
  "uploaded_by" text,
  "created_at" text
);
GRANT SELECT ON public."task_attachments" TO anon, authenticated;
GRANT ALL ON public."task_attachments" TO service_role;
DROP TABLE IF EXISTS public."tasks" CASCADE;
CREATE TABLE public."tasks" (
  "id" uuid,
  "title" text,
  "description" text,
  "status" text,
  "priority" text,
  "due_date" text,
  "assigned_to" text,
  "created_by" uuid,
  "client_id" text,
  "meeting_id" text,
  "project_id" text,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."tasks" TO anon, authenticated;
GRANT ALL ON public."tasks" TO service_role;
DROP TABLE IF EXISTS public."unified_documents" CASCADE;
CREATE TABLE public."unified_documents" (
  "id" text,
  "title" text,
  "content" text,
  "owner_type" text,
  "owner_id" text,
  "source_type" text,
  "source_id" text,
  "file_name" text,
  "file_type" text,
  "file_size" text,
  "storage_path" text,
  "processing_status" text,
  "metadata" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."unified_documents" TO anon, authenticated;
GRANT ALL ON public."unified_documents" TO service_role;
DROP TABLE IF EXISTS public."user_agent_personalizations" CASCADE;
CREATE TABLE public."user_agent_personalizations" (
  "id" text,
  "user_id" text,
  "agent_id" text,
  "is_enabled" text,
  "additional_prompt" text,
  "attached_knowledge_files" text,
  "use_all_knowledge" text,
  "max_context_files" text,
  "relevance_threshold" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."user_agent_personalizations" TO anon, authenticated;
GRANT ALL ON public."user_agent_personalizations" TO service_role;
DROP TABLE IF EXISTS public."user_invites" CASCADE;
CREATE TABLE public."user_invites" (
  "id" text,
  "email" text,
  "role" text,
  "agency_role" text,
  "org_id" text,
  "invited_by" text,
  "token" text,
  "expires_at" text,
  "used_at" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."user_invites" TO anon, authenticated;
GRANT ALL ON public."user_invites" TO service_role;
DROP TABLE IF EXISTS public."user_knowledge_files" CASCADE;
CREATE TABLE public."user_knowledge_files" (
  "id" text,
  "user_id" text,
  "file_name" text,
  "file_type" text,
  "file_size" text,
  "storage_path" text,
  "processing_status" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."user_knowledge_files" TO anon, authenticated;
GRANT ALL ON public."user_knowledge_files" TO service_role;
DROP TABLE IF EXISTS public."user_knowledge_sources" CASCADE;
CREATE TABLE public."user_knowledge_sources" (
  "id" text,
  "user_id" text,
  "name" text,
  "source_type" text,
  "config" text,
  "is_active" text,
  "last_sync_at" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."user_knowledge_sources" TO anon, authenticated;
GRANT ALL ON public."user_knowledge_sources" TO service_role;
DROP TABLE IF EXISTS public."user_microsoft_teams" CASCADE;
CREATE TABLE public."user_microsoft_teams" (
  "id" text,
  "user_id" text,
  "team_id" text,
  "team_name" text,
  "is_active" text,
  "created_at" text
);
GRANT SELECT ON public."user_microsoft_teams" TO anon, authenticated;
GRANT ALL ON public."user_microsoft_teams" TO service_role;
DROP TABLE IF EXISTS public."user_microsoft_teams_channels" CASCADE;
CREATE TABLE public."user_microsoft_teams_channels" (
  "id" text,
  "user_id" text,
  "team_id" text,
  "channel_id" text,
  "channel_name" text,
  "is_active" text,
  "created_at" text
);
GRANT SELECT ON public."user_microsoft_teams_channels" TO anon, authenticated;
GRANT ALL ON public."user_microsoft_teams_channels" TO service_role;
DROP TABLE IF EXISTS public."user_module_permissions" CASCADE;
CREATE TABLE public."user_module_permissions" (
  "id" text,
  "user_id" text,
  "module_id" text,
  "has_access" text,
  "created_at" text
);
GRANT SELECT ON public."user_module_permissions" TO anon, authenticated;
GRANT ALL ON public."user_module_permissions" TO service_role;
DROP TABLE IF EXISTS public."user_preferences" CASCADE;
CREATE TABLE public."user_preferences" (
  "id" text,
  "user_id" text,
  "agent_id" text,
  "preference_key" text,
  "preference_value" text,
  "learned_from" text,
  "confidence_score" text,
  "evidence_count" text,
  "times_used" text,
  "last_used_at" text,
  "is_active" text,
  "created_at" text,
  "updated_at" text
);
GRANT SELECT ON public."user_preferences" TO anon, authenticated;
GRANT ALL ON public."user_preferences" TO service_role;
DROP TABLE IF EXISTS public."user_role_preferences" CASCADE;
CREATE TABLE public."user_role_preferences" (
  "id" uuid,
  "user_id" uuid,
  "role" text,
  "agency_role" text,
  "is_eos_user" boolean,
  "created_at" timestamptz,
  "updated_at" timestamptz
);
GRANT SELECT ON public."user_role_preferences" TO anon, authenticated;
GRANT ALL ON public."user_role_preferences" TO service_role;
DROP TABLE IF EXISTS public."user_roles" CASCADE;
CREATE TABLE public."user_roles" (
  "id" uuid,
  "user_id" uuid,
  "role" text,
  "created_at" timestamptz
);
GRANT SELECT ON public."user_roles" TO anon, authenticated;
GRANT ALL ON public."user_roles" TO service_role;
DROP TABLE IF EXISTS public."vector_search_logs" CASCADE;
CREATE TABLE public."vector_search_logs" (
  "id" text,
  "user_id" text,
  "query" text,
  "results_count" text,
  "latency_ms" text,
  "metadata" text,
  "created_at" text
);
GRANT SELECT ON public."vector_search_logs" TO anon, authenticated;
GRANT ALL ON public."vector_search_logs" TO service_role;
DROP TABLE IF EXISTS public."zoom_files" CASCADE;
CREATE TABLE public."zoom_files" (
  "id" text,
  "meeting_id" text,
  "file_url" text,
  "file_type" text,
  "file_size" text,
  "download_url" text,
  "recording_type" text,
  "status" text,
  "created_at" text,
  "has_embeddings" text,
  "processing_status" text,
  "file_name" text,
  "updated_at" text
);
GRANT SELECT ON public."zoom_files" TO anon, authenticated;
GRANT ALL ON public."zoom_files" TO service_role;
