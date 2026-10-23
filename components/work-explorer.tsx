"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collectKeywords,
  effectiveSelection,
  filterProjects,
  keywordLinks,
  keywordsToHref,
  parseKeywords,
  toggleKeyword,
} from "@/lib/projects";
import type { Project } from "@/lib/types";
import { ProjectFilter } from "./project-filter";
import { ProjectList } from "./project-list";

export function WorkExplorer({
  projects,
  initialSelected,
}: {
  projects: Project[];
  initialSelected: string[];
}) {
  const catalog = useMemo(() => collectKeywords(projects), [projects]);
  const [selected, setSelected] = useState(initialSelected);
  const links = keywordLinks(catalog, selected);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSelected(effectiveSelection(catalog, parseKeywords(params.getAll("keywords"))));
    };

    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [catalog]);

  function select(key: string | null) {
    const next = key == null ? [] : toggleKeyword(catalog, selected, key);
    window.history.pushState(null, "", keywordsToHref(next));
    setSelected(next);
  }

  return (
    <>
      <ProjectFilter links={links} allSelected={selected.length === 0} onSelect={select} />
      <ProjectList projects={filterProjects(projects, selected)} links={links} onSelect={select} />
    </>
  );
}
