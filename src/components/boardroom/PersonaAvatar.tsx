import { PERSONA_BY_ID, type PersonaId } from "./personas";
import { cn } from "@/lib/utils";

interface Props {
  persona: PersonaId;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function PersonaAvatar({ persona, size = "md", active }: Props) {
  const meta = PERSONA_BY_ID[persona];
  const px = size === "sm" ? 32 : size === "lg" ? 64 : 44;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-semibold text-white shadow-md",
        active && "ring-4 ring-offset-2 ring-offset-background",
      )}
      style={{
        width: px,
        height: px,
        background: `linear-gradient(135deg, ${meta.accent} 0%, ${shade(meta.accent, -25)} 100%)`,
        fontSize: px * 0.36,
        boxShadow: active ? `0 0 0 4px ${meta.accent}33` : undefined,
        // @ts-expect-error custom property
        "--tw-ring-color": meta.accent,
      }}
    >
      {meta.initials}
      {active && (
        <span
          className="absolute -bottom-1 -right-1 flex h-3 w-3"
          aria-hidden
        >
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: meta.accent }}
          />
          <span
            className="relative inline-flex h-3 w-3 rounded-full"
            style={{ background: meta.accent }}
          />
        </span>
      )}
    </div>
  );
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(255 * (percent / 100))));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * (percent / 100))));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * (percent / 100))));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
