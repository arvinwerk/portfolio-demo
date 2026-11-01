export interface TranscriptSeal {
  sign(id: string, text: string, context: string): string;
  matches(id: string, text: string, context: string, signature: string | undefined): boolean;
}

function field(value: string): string {
  return `${value.length}:${value}`;
}

export function transcriptContext(turns: readonly { role: string; id: string; text: string }[]): string {
  return turns.map((turn) => field(turn.role) + field(turn.id) + field(turn.text)).join("");
}

export function transcriptSealPayload(id: string, text: string, context: string): string {
  return `portfolio-chat-v2\n${field(context)}${field(id)}${field(text)}`;
}
