"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PortfolioPage } from "../application/compose-portfolio-page";
import { knownScenario, type ArchitectureScenarioId } from "../domain/architecture-atlas";
import { isCuriosity, type Curiosity } from "../domain/curiosity";
import { minuteKicker, minuteNeighbour, minuteTradeOff, proofProject, type MinuteBeat } from "../domain/minute";
import type { PersonalProfile } from "../domain/model";
import { parseKeywords } from "../domain/projects";
import { About } from "./about";
import { Banner } from "./banner";
import { CuriosityBand } from "./curiosity-band";
import { MinuteRoom } from "./minute-room";
import { sceneRegistry } from "./scenes";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Skills } from "./skills";
import { VCard } from "./v-card";
import { WorkExplorer } from "./work-explorer";
import { workspaceHref } from "./keyword-href";
import { XRayPanel } from "./x-ray-panel";

const LENS_LABEL: Record<Curiosity, string> = {
  portrait: "Portret",
  work: "Mijn werk",
  thinking: "Hoe ik denk",
  experiments: "AI-experimenten",
  challenge: "Daag me uit",
};

type Trace = { id: string; detail: string };

export function Experience({
  model,
  chatAction,
  studyBench,
}: {
  model: PortfolioPage;
  chatAction?: ReactNode;
  studyBench?: ReactNode;
}) {
  const router = useRouter();
  const reduce = useReducedMotion() === true;
  const [motionReady, setMotionReady] = useState(false);
  const [lens, setLens] = useState(model.lens);
  const [focus, setFocus] = useState<ArchitectureScenarioId | null>(model.scenario);
  const [minute, setMinute] = useState<MinuteBeat | null>(model.minute);
  const [note, setNote] = useState<string | null>(null);
  const [origin, setOrigin] = useState<"catalog" | "model" | null>(null);
  const [xray, setXray] = useState(false);
  const [transitions, setTransitions] = useState<Trace[]>([]);
  const [requests, setRequests] = useState<Trace[]>([]);
  const [boundaries, setBoundaries] = useState<string[]>([]);
  const pending = useRef<string | null>(null);
  const commitRef = useRef<
    (
      next: Curiosity,
      scenario: ArchitectureScenarioId | null,
      hash: string,
      options?: { note?: string | null; origin?: "catalog" | "model" | null; keepNote?: boolean; minute?: MinuteBeat | null },
    ) => void
  >(() => undefined);
  const pendingHash = useRef<string | null>(null);
  const lensRef = useRef(lens);
  const workspaceRef = useRef<HTMLElement>(null);
  const sawLens = useRef(false);
  const serverKey = `${model.lens}|${model.scenario ?? ""}|${model.minute ?? ""}`;
  const minuteRef = useRef<MinuteBeat | null>(minute);
  const xrayRef = useRef(xray);
  const calm = motionReady && reduce;
  lensRef.current = lens;
  minuteRef.current = minute;
  xrayRef.current = xray;

  useEffect(() => {
    setMotionReady(true);
  }, []);

  useEffect(() => {
    if (pending.current !== null && pending.current !== serverKey) {
      return;
    }
    pending.current = null;
    setLens(model.lens);
    setFocus(model.scenario);
    setMinute(model.minute);
  }, [serverKey, model.lens, model.scenario, model.minute]);

  useEffect(() => {
    const onPop = () => {
      pending.current = null;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onGuide = (event: Event) => {
      const detail = readGuide((event as CustomEvent<unknown>).detail);
      if (!detail) {
        return;
      }
      if (detail.lead) {
        commitRef.current("portrait", null, "", { minute: "wie" });
        return;
      }
      commitRef.current(detail.surface, detail.focus, "", { note: detail.explanation, origin: detail.origin });
    };
    window.addEventListener("portfolio-guide", onGuide);
    return () => window.removeEventListener("portfolio-guide", onGuide);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      if (event.key === "x" || event.key === "X") {
        event.preventDefault();
        setXray((value) => !value);
        return;
      }
      if (event.key === "Escape") {
        if (xrayRef.current) {
          setXray(false);
          return;
        }
        if (minuteRef.current) {
          event.preventDefault();
          commitRef.current("portrait", null, "");
        }
        return;
      }
      if (!minuteRef.current) {
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const beat = minuteNeighbour(minuteRef.current, direction);
        if (!beat) {
          return;
        }
        event.preventDefault();
        commitRef.current("portrait", null, "", { minute: beat });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") {
      return;
    }
    const observer = new PerformanceObserver((list) => {
      const found = list.getEntries().flatMap((entry) => {
        let url: URL;
        try {
          url = new URL(entry.name);
        } catch {
          return [];
        }
        if (!url.pathname.startsWith("/api/")) {
          return [];
        }
        const status = "responseStatus" in entry && typeof entry.responseStatus === "number" ? entry.responseStatus : null;
        return [{ id: crypto.randomUUID(), detail: `${url.pathname} · ${status ?? "—"} · ${Math.round(entry.duration)} ms` }];
      });
      if (found.length === 0) {
        return;
      }
      setRequests((current) => [...found, ...current].slice(0, 8));
    });
    observer.observe({ type: "resource", buffered: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("xray", xray);
    return () => document.body.classList.remove("xray");
  }, [xray]);

  useEffect(() => {
    if (!xray) {
      return;
    }
    const names = [...document.querySelectorAll("[data-boundary]")]
      .map((node) => node.getAttribute("data-boundary"))
      .filter((name): name is string => Boolean(name));
    setBoundaries([...new Set(names)]);
  }, [xray, lens]);

  useEffect(() => {
    if (!pendingHash.current || lens !== "portrait" || minute) {
      return;
    }
    const id = pendingHash.current.replace("#", "");
    pendingHash.current = null;
    document.getElementById(id)?.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
  }, [lens, minute, calm]);

  useEffect(() => {
    if (!sawLens.current) {
      sawLens.current = true;
      return;
    }
    if (minuteRef.current) {
      document.getElementById("minuut")?.focus();
      return;
    }
    workspaceRef.current?.focus();
  }, [lens, minute]);

  function commit(
    next: Curiosity,
    scenario: ArchitectureScenarioId | null,
    hash: string,
    options?: { note?: string | null; origin?: "catalog" | "model" | null; keepNote?: boolean; minute?: MinuteBeat | null },
  ) {
    const minuteNext = options?.minute ?? null;
    const resolved = minuteNext || next !== "thinking" ? null : scenario;
    const lensNext = minuteNext ? "portrait" : next;
    if (minuteNext !== minuteRef.current || (!minuteNext && lensNext !== lensRef.current)) {
      const from = minuteRef.current ? minuteKicker(minuteRef.current) : LENS_LABEL[lensRef.current];
      const to = minuteNext ? minuteKicker(minuteNext) : LENS_LABEL[lensNext];
      setTransitions((current) => [{ id: crypto.randomUUID(), detail: `${from} → ${to}` }, ...current].slice(0, 6));
    }
    if (!options?.keepNote) {
      setNote(options?.note ?? null);
      setOrigin(options?.origin ?? null);
    }
    pending.current = `${lensNext}|${resolved ?? ""}|${minuteNext ?? ""}`;
    setLens(lensNext);
    setMinute(minuteNext);
    setFocus(resolved);
    if (hash) {
      pendingHash.current = hash;
    }
    const keywords = parseKeywords(new URLSearchParams(window.location.search).getAll("keywords"));
    router.push(workspaceHref({ keywords, lens: minuteNext ? undefined : lensNext, scenario: resolved, minute: minuteNext, hash }), { scroll: false });
  }

  commitRef.current = commit;

  const skillCount = model.skillGroups.reduce((total, group) => total + group.skills.length, 0);
  const scene =
    lens === "portrait"
      ? null
      : sceneRegistry[lens]({
          model,
          focus,
          note,
          origin,
          studyBench,
          onScenario: (id) => commit("thinking", id, "", { keepNote: true }),
        });

  return (
    <>
      <SiteHeader
        name={model.profile.fullName}
        disclaimer={model.profile.statements.disclaimer}
        action={chatAction}
        onMinute={minute ? undefined : () => commit("portrait", null, "", { minute: "wie" })}
        onSection={lens === "portrait" || minute ? undefined : (id) => commit("portrait", null, `#${id}`)}
        xray={{ pressed: xray, onToggle: () => setXray((value) => !value) }}
      />
      <main id="inhoud" className="pb-24">
        <p className="sr-only" aria-live="polite">
          Werkruimte: {LENS_LABEL[lens]}
        </p>
        <AnimatePresence initial={false}>
          <motion.div
            key={minute ?? lens}
            initial={calm ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={calm ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: calm ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {minute ? (
              <MinuteRoom
                beat={minute}
                facts={{ years: model.yearsAsDeveloper, projects: model.allProjects.length }}
                project={proofProject(model.allProjects)}
                tradeOff={minuteTradeOff()}
                profile={model.profile}
                yearsAsDeveloper={model.yearsAsDeveloper}
                skillCount={skillCount}
                onBeat={(beat) => commit("portrait", null, "", { minute: beat })}
                onLeave={() => commit("portrait", null, "")}
                onProjects={() => commit("portrait", null, "#werk")}
              />
            ) : lens === "portrait" ? (
              <Portrait model={model} onMinute={() => commit("portrait", null, "", { minute: "wie" })} onSelect={(id) => commit(id, null, "")} />
            ) : (
              <section
                ref={workspaceRef}
                tabIndex={-1}
                id="werkruimte"
                className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-5xl flex-col px-4 pt-4 pb-8 outline-none"
                data-boundary="werkruimte"
              >
                <CompactIdentity
                  profile={model.profile}
                  yearsAsDeveloper={model.yearsAsDeveloper}
                  projectCount={model.allProjects.length}
                  skillCount={skillCount}
                />
                <div className="mt-3">
                  <CuriosityBand
                    variant="rail"
                    current={lens}
                    onSelect={(id) => commit(id, null, "")}
                    onPortrait={() => commit("portrait", null, "")}
                  />
                </div>
                <div className="mt-3 flex min-h-0 flex-1 flex-col">{scene}</div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter
        name={model.profile.fullName}
        email={model.profile.email}
        linkedIn={model.profile.linkedIn}
        github={model.profile.github}
        note={model.profile.statements.footerNote}
      />
      {xray ? (
        <XRayPanel transitions={transitions} requests={requests} boundaries={boundaries} onClose={() => setXray(false)} />
      ) : null}
    </>
  );
}

function Portrait({
  model,
  onSelect,
  onMinute,
}: {
  model: PortfolioPage;
  onSelect: (lens: Exclude<Curiosity, "portrait">) => void;
  onMinute: () => void;
}) {
  const [firstBanner, secondBanner] = model.banners;
  const skillCount = model.skillGroups.reduce((total, group) => total + group.skills.length, 0);

  return (
    <>
      <VCard
        profile={model.profile}
        yearsAsDeveloper={model.yearsAsDeveloper}
        projectCount={model.allProjects.length}
        skillCount={skillCount}
      />
      <CuriosityBand current="portrait" variant="stage" onSelect={onSelect} onMinute={onMinute} />
      <About foreword={model.forewordParagraphs} github={model.profile.github} githubDescription={model.githubParagraphs} />
      <Skills groups={model.skillGroups} />
      {firstBanner ? <Banner banner={firstBanner} /> : null}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20" id="werk" aria-labelledby="work-title" data-boundary="werk">
        <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">Werk</p>
        <h2 id="work-title" className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
          Werkervaring
        </h2>
        <div className="mt-8">
          <WorkExplorer projects={model.allProjects} initialSelected={model.selectedKeywords} />
        </div>
      </section>
      {secondBanner ? <Banner banner={secondBanner} /> : null}
    </>
  );
}

function CompactIdentity({
  profile,
  yearsAsDeveloper,
  projectCount,
  skillCount,
}: {
  profile: PersonalProfile;
  yearsAsDeveloper: number;
  projectCount: number;
  skillCount: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-3" data-boundary="identiteit">
      <div>
        <p className="font-ui text-xs font-medium tracking-[0.22em] text-primary uppercase">{profile.function}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">{profile.fullName}</h1>
      </div>
      <dl className="flex gap-6">
        <Fact value={yearsAsDeveloper} label="jaar" />
        <Fact value={projectCount} label={projectCount === 1 ? "project" : "projecten"} />
        <Fact value={skillCount} label={skillCount === 1 ? "vaardigheid" : "vaardigheden"} />
      </dl>
    </div>
  );
}

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl leading-none font-semibold text-ink">{value}</dt>
      <dd className="mt-1 text-xs text-muted">{label}</dd>
    </div>
  );
}

function readGuide(value: unknown): {
  surface: Curiosity;
  focus: ArchitectureScenarioId | null;
  explanation: string;
  origin: "catalog" | "model";
  lead: boolean;
} | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (!isCuriosity(record.surface) || typeof record.explanation !== "string") {
    return null;
  }
  const explanation = record.explanation.trim();
  if (!explanation || explanation.length > 600) {
    return null;
  }
  if (record.origin !== "catalog" && record.origin !== "model") {
    return null;
  }
  return {
    surface: record.surface,
    focus: knownScenario(record.focus),
    explanation,
    origin: record.origin,
    lead: record.lead === true,
  };
}
