import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface DiffViewProps {
  diff: {
    new?: string[];
    resolved?: string[];
    persisted?: string[];
    prev_health?: number | null;
  } | null | undefined;
  currentHealth: number | null;
}

export default function DiffView({ diff, currentHealth }: DiffViewProps) {
  const nu = diff?.new ?? [];
  const resolved = diff?.resolved ?? [];
  const persisted = diff?.persisted ?? [];
  const delta = currentHealth != null && diff?.prev_health != null ? currentHealth - diff.prev_health : null;

  if (!diff || (nu.length === 0 && resolved.length === 0 && persisted.length === 0)) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No prior scan to compare against. Run another scan to see what changed.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {delta != null && (
        <Card className={`border-l-4 ${delta > 0 ? "border-l-green-500" : delta < 0 ? "border-l-red-500" : "border-l-muted"}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="font-medium">
                Health {delta > 0 ? "improved" : delta < 0 ? "dropped" : "unchanged"}: {diff?.prev_health} → {currentHealth}
                {" "}<span className={delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : ""}>
                  ({delta > 0 ? "+" : ""}{delta} pts)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500" />
            New issues since last scan
            <Badge variant="destructive">{nu.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nu.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing new — good news.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {nu.map((t, i) => <li key={i} className="flex items-start gap-2">🆕 <span>{t}</span></li>)}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Resolved since last scan
            <Badge className="bg-green-500 text-white">{resolved.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resolved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing resolved yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {resolved.map((t, i) => <li key={i} className="flex items-start gap-2">✅ <span className="line-through text-muted-foreground">{t}</span></li>)}
            </ul>
          )}
        </CardContent>
      </Card>

      {persisted.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              Still open <Badge variant="secondary">{persisted.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {persisted.map((t, i) => <li key={i} className="flex items-start gap-2">⏳ <span>{t}</span></li>)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
