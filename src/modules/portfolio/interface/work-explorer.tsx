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
}: {
  projects: Project[];
  initialSelected: string[];
}) {
  const router = useRouter();
  const catalog = useMemo(() => collectKeywords(projects), [projects]);
  const [selected, setSelected] = useState(initialSelected);
  const pendingHref = useRef<string | null>(null);
  const initialKey = initialSelected.join("\u0000");
  const links = keywordLinks(catalog, selected);

  useEffect(() => {
    const href = keywordsToHref(initialSelected);
    if (pendingHref.current !== null && pendingHref.current !== href) {
      return;
    }
    pendingHref.current = null;
    setSelected(initialSelected);
  }, [initialKey, initialSelected]);

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
    const href = keywordsToHref(next);
    pendingHref.current = href;
    setSelected(next);
    router.push(href, { scroll: false });
  }

  return (
    <>
      <ProjectFilter links={links} allSelected={selected.length === 0} onSelect={select} />
      <ProjectList projects={filterProjects(projects, selected)} links={links} onSelect={select} />
    </>
  );
}
