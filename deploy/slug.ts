const MAX_LABEL = 63;

export function previewSlug(branch: string): string | undefined {
  const trimmed = branch.trim().replace(/^refs\/heads\//, "").toLowerCase();
  if (trimmed.length === 0 || trimmed === "master" || trimmed === "main") {
    return undefined;
  }

  let slug = trimmed
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length > MAX_LABEL) {
    slug = slug.slice(0, MAX_LABEL).replace(/-+$/g, "");
  }
  if (!isSlug(slug)) {
    return undefined;
  }
  return slug;
}

export function isSlug(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value);
}
