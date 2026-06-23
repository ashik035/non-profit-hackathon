// Permissive shim for Supabase generated types.
// The auto-generated types.ts file currently has an empty schema (the connected
// external Supabase project has not been introspected here), so directly using
// it produces hundreds of TS2769/TS2345 errors across the app.
//
// This shim is wired in via a tsconfig `paths` override for
// `@/integrations/supabase/types` so every import sees permissive `any`-based
// helpers and the app keeps compiling. Replace this once the real generated
// types reflect the live database.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type AnyRow = {
  Row: any;
  Insert: any;
  Update: any;
  Relationships: any[];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: { [key: string]: AnyRow };
    Views: { [key: string]: AnyRow };
    Functions: { [key: string]: { Args: any; Returns: any } };
    Enums: { [key: string]: string };
    CompositeTypes: { [key: string]: any };
  };
};

export type Tables<_T = string, _U = unknown> = any;
export type TablesInsert<_T = string, _U = unknown> = any;
export type TablesUpdate<_T = string, _U = unknown> = any;
export type Enums<_T = string, _U = unknown> = any;
export type CompositeTypes<_T = string, _U = unknown> = any;

export const Constants = {
  public: {
    Enums: {} as Record<string, readonly string[]>,
  },
} as const;
