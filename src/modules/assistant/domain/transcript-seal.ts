export interface TranscriptSeal {
  sign(id: string, text: string): string;
  matches(id: string, text: string, signature: string | undefined): boolean;
}
