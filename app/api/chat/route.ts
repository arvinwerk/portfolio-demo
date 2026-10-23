import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { loadContent } from "@/lib/content";
import { buildPageModel } from "@/lib/page-model";
import { AiConfigError, ChatRequestError, parseChatMessages, readAiConfig } from "@/lib/ai";

export const maxDuration = 30;

const instructions = `Je bent de assistent op de portfolio van Arvin Sokarijo.
Antwoord kort en in het Nederlands.
Gebruik alleen de feiten hieronder. Verzin geen projecten, datums of contactgegevens.`;

export async function POST(request: Request) {
  let messages;
  try {
    const body = (await request.json()) as { messages?: unknown };
    messages = parseChatMessages(body.messages);
  } catch (error) {
    const message = error instanceof ChatRequestError ? error.message : "Ongeldig verzoek.";
    return Response.json({ error: message }, { status: 400 });
  }

  let config;
  try {
    config = readAiConfig();
  } catch (error) {
    const message = error instanceof AiConfigError ? error.message : "De chat is niet geconfigureerd.";
    return Response.json({ error: message }, { status: 503 });
  }

  const anthropic = createAnthropic({ apiKey: config.apiKey });
  const result = streamText({
    model: anthropic(config.model),
    system: `${instructions}\n\n${portfolioBrief()}`,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}

function portfolioBrief(): string {
  const model = buildPageModel(loadContent());
  const skills = model.skillGroups
    .map((group) => `${group.label}: ${group.skills.map((skill) => `${skill.name} ${skill.percentage}%`).join(", ")}`)
    .join("\n");
  const projects = model.allProjects
    .map((project) => `${project.title} bij ${project.company}. ${project.shortDescription} Trefwoorden: ${project.keywords.join(", ")}.`)
    .join("\n");

  return [
    `Naam: ${model.personal.fullName}`,
    `Functie: ${model.personal.function}`,
    `Opleiding: ${model.personal.education}`,
    `Plaats: ${model.personal.location}`,
    model.forewordParagraphs.join("\n"),
    "Skills:",
    skills,
    "Werk:",
    projects,
  ].join("\n");
}
