"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "../domain/model";
import {
  collectKeywords,
  effectiveSelection,
  filterProjects,
  parseKeywords,
  toggleKeyword,
} from "../domain/projects";
import { keywordLinks, keywordsToHref } from "./keyword-href";
import { ProjectFilter } from "./project-filter";
import { ProjectList } from "./project-list";

export function WorkExplorer({
  projects,
  initialSelected,
  lens,
}: {
  projects: Project[];
  initialSelected: string[];
  lens?: string;
}) {
  const router = useRouter();
  const catalog = useMemo(() => collectKeywords(projects), [projects]);
  const [selected, setSelected] = useState(initialSelected);
  const pendingHref = useRef<string | null>(null);
  const initialKey = initialSelected.join("\u0000");
  const links = keywordLinks(catalog, selected, lens);

  useEffect(() => {
    const href = keywordsToHref(initialSelected, lens && lens !== "portrait" ? { lens } : undefined);
    if (pendingHref.current !== null && pendingHref.current !== href) {
      return;
    }
    pendingHref.current = null;
    setSelected(initialSelected);
  }, [initialKey, initialSelected, lens]);

  useEffect(() => {
    const syncFromUrl = () => {
      pendingHref.current = null;
      const params = new URLSearchParams(window.location.search);
      setSelected(effectiveSelection(catalog, parseKeywords(params.getAll("keywords"))));
    };

    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [catalog]);

  function select(key: string | null) {
    const next = key == null ? [] : toggleKeyword(catalog, selected, key);
    const href = keywordsToHref(next, lens && lens !== "portrait" ? { lens } : undefined);
    pendingHref.current = href;
    setSelected(next);
    router.push(href, { scroll: false });
  }

  return (
    <>
      <ProjectFilter links={links} allSelected={selected.length === 0} onSelect={select} lens={lens} />
      <ProjectList projects={filterProjects(projects, selected)} links={links} onSelect={select} />
    </>
  );
}
