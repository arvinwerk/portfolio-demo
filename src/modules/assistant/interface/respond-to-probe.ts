import { probeProfile } from "../application/probe-profile";
import type { VisitorGate } from "../application/visitor-gate";
import { ProbeRejected } from "../domain/probe";
import type { ProfileKnowledge } from "../domain/profile-knowledge";
import { clientAddress } from "./client-address";

const MAX_BODY_BYTES = 8 * 1024;

export async function respondToProbe(
  request: Request,
  deps: { gate: VisitorGate; knowledge: ProfileKnowledge },
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

  let query: unknown;
  try {
    query = (JSON.parse(raw) as { query?: unknown }).query;
  } catch {
    return Response.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  try {
    const plan = await probeProfile({
      query,
      address: clientAddress(request),
      gate: deps.gate,
      knowledge: deps.knowledge,
    });

    if (plan.kind === "limited") {
      return Response.json(
        { error: "Te veel verzoeken. Wacht even en probeer het opnieuw." },
        { status: 429, headers: { "retry-after": String(plan.retryAfterSeconds) } },
      );
    }

    return Response.json({ found: plan.found, fragments: plan.fragments, note: plan.note ?? null });
  } catch (error) {
    if (error instanceof ProbeRejected) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "Het zoeken lukte niet. Probeer het opnieuw." }, { status: 502 });
  }
}
