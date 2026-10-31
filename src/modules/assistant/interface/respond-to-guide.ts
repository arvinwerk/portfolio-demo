import { GuidanceRejected } from "../domain/guidance";
import { guideVisitor, type GuidanceInterpreter } from "../application/guide-visitor";
import type { VisitorGate } from "../application/visitor-gate";
import { clientAddress } from "./client-address";

const MAX_BODY_BYTES = 8 * 1024;

export async function respondToGuide(
  request: Request,
  deps: {
    gate: VisitorGate;
    interpreter(): GuidanceInterpreter | null;
  },
): Promise<Response> {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return Response.json({ error: "Het verzoek is te groot." }, { status: 413 });
  }

  let text: unknown;
  try {
    text = (JSON.parse(raw) as { text?: unknown }).text;
  } catch {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  try {
    const plan = await guideVisitor({
      text,
      address: clientAddress(request),
      gate: deps.gate,
      interpreter: deps.interpreter(),
    });

    if (plan.kind === "limited") {
      return Response.json(
        { error: "Te veel verzoeken. Wacht even en probeer het opnieuw." },
        { status: 429, headers: { "retry-after": String(plan.retryAfterSeconds) } },
      );
    }

    return Response.json(plan.guidance);
  } catch (error) {
    if (error instanceof GuidanceRejected) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "De verkenning lukte niet. Probeer het opnieuw." }, { status: 502 });
  }
}
