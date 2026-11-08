import type { ChatTranscript } from "../domain/chat-transcript";

export interface ChatLog {
  save(transcript: ChatTranscript): Promise<void>;
}
