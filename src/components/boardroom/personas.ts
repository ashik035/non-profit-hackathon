// Persona display metadata mirrored from the edge function.
export type PersonaId = "elena" | "marcus" | "david" | "priya";

export interface PersonaMeta {
  id: PersonaId;
  name: string;
  role: string;
  accent: string;
  initials: string;
  blurb: string;
}

export const PERSONAS: PersonaMeta[] = [
  {
    id: "elena",
    name: "Elena Vasquez",
    role: "Board Chair",
    accent: "#8b5cf6",
    initials: "EV",
    blurb: "Mission alignment & governance",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    role: "Treasurer / CFO",
    accent: "#0ea5e9",
    initials: "MC",
    blurb: "Cash, runway & audit risk",
  },
  {
    id: "david",
    name: "David Okafor",
    role: "Vice Chair, Growth",
    accent: "#10b981",
    initials: "DO",
    blurb: "Pipeline, partnerships & boldness",
  },
  {
    id: "priya",
    name: "Priya Raman",
    role: "Community Director",
    accent: "#f59e0b",
    initials: "PR",
    blurb: "Equity, beneficiaries & program quality",
  },
];

export const PERSONA_BY_ID: Record<PersonaId, PersonaMeta> = Object.fromEntries(
  PERSONAS.map((p) => [p.id, p]),
) as Record<PersonaId, PersonaMeta>;
