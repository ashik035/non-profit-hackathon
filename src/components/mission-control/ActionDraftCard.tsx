import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, Edit3, X, Sparkles, Send } from "lucide-react";
import type { MCAction } from "@/hooks/useMissionControlActions";

interface Props {
  action: MCAction;
  onExecute: (id: string, edited?: string) => Promise<void> | void;
  onDismiss: (id: string, reason: string) => Promise<void> | void;
  executing: string | null;
}

const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  donor_email: { label: "Donor Re-engagement Email", icon: "💌" },
  grant_reminder: { label: "Grant Action Plan", icon: "🎯" },
  comms_draft: { label: "Communications Draft", icon: "📣" },
  cleanup_checklist: { label: "Data Cleanup Checklist", icon: "🧹" },
  task_reassign: { label: "Operations Task", icon: "📋" },
  board_memo: { label: "Board Memo", icon: "📄" },
};

export default function ActionDraftCard({ action, onExecute, onDismiss, executing }: Props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(action.edited_content ?? action.draft_content);
  const meta = TYPE_LABEL[action.action_type] ?? { label: "AI Action", icon: "✨" };
  const isExecuting = executing === action.id;
  const isDone = action.status === "executed";
  const isDismissed = action.status === "dismissed";

  return (
    <Card className={`border-l-4 ${isDone ? "border-l-green-500 bg-green-50/30 dark:bg-green-950/10" : isDismissed ? "border-l-muted opacity-60" : "border-l-primary"}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{meta.icon}</span>
            <div>
              <div className="font-semibold text-sm">{meta.label}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{action.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] gap-1"><Sparkles className="w-3 h-3" /> AI-drafted</Badge>
            {isDone && <Badge className="bg-green-500 text-white text-[10px]">Executed</Badge>}
            {isDismissed && <Badge variant="secondary" className="text-[10px]">Dismissed</Badge>}
          </div>
        </div>

        {editing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="text-sm font-mono"
          />
        ) : (
          <pre className="text-xs whitespace-pre-wrap bg-muted/40 p-3 rounded-md border border-border max-h-72 overflow-y-auto font-sans leading-relaxed">
{content}
          </pre>
        )}

        {!isDone && !isDismissed && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onExecute(action.id, editing ? content : undefined)}
              disabled={isExecuting}
            >
              {isExecuting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
              {editing ? "Approve edited" : "Approve & execute"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing((e) => !e)}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              {editing ? "Cancel edit" : "Edit"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDismiss(action.id, "not actionable")}>
              <X className="w-3.5 h-3.5 mr-1.5" />
              Dismiss
            </Button>
          </div>
        )}
        {isDone && action.executed_at && (
          <div className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Executed {new Date(action.executed_at).toLocaleString()}
            {action.destination && (action.destination as any).task_id && (
              <span className="text-muted-foreground">· task created</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
