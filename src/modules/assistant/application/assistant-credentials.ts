export class AssistantNotConfigured extends Error {
  constructor(message = "Zet AI_MODEL en AI_API_KEY.") {
    super(message);
    this.name = "AssistantNotConfigured";
  }
}

export type AssistantCredentials = {
  model: string;
  apiKey: string;
};
