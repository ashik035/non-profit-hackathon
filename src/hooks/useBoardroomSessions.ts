import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys, invalidateKeys } from "@/lib/cache";
import {
  buildSessionInsert,
  type BoardroomSessionRow,
  type SaveBoardroomSessionInput,
} from "@/lib/boardroomSessionMapper";

export type BoardroomSessionSummary = Pick<
  BoardroomSessionRow,
  | "id"
  | "question"
  | "status"
  | "memo"
  | "vote"
  | "risks"
  | "dissent"
  | "transcript"
  | "created_at"
  | "updated_at"
>;

const LIST_COLUMNS =
  "id, question, status, memo, vote, risks, dissent, transcript, created_at, updated_at" as const;

export function useBoardroomSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.boardroom.list(),
    queryFn: async (): Promise<BoardroomSessionSummary[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("boardroom_sessions")
        .select(LIST_COLUMNS)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as BoardroomSessionSummary[];
    },
    enabled: !!user?.id,
  });
}

export function useBoardroomSession(id: string | null | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.boardroom.detail(id ?? ""),
    queryFn: async (): Promise<BoardroomSessionRow> => {
      if (!user?.id || !id) {
        throw new Error("Session not available");
      }

      const { data, error } = await supabase
        .from("boardroom_sessions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Session not found");
      return data as BoardroomSessionRow;
    },
    enabled: !!user?.id && !!id,
    retry: false,
  });
}

export function useSaveBoardroomSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveBoardroomSessionInput): Promise<string> => {
      if (!user?.id) throw new Error("You must be signed in.");

      const row = buildSessionInsert(user.id, input);
      const { data, error } = await supabase
        .from("boardroom_sessions")
        .insert(row)
        .select("id")
        .single();

      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      invalidateKeys.boardroomSessions(queryClient);
    },
  });
}

export function useRecentBoardroomSessions(limit = 3) {
  const query = useBoardroomSessions();
  const sessions = query.data ?? [];
  return {
    sessions: sessions.slice(0, limit),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
