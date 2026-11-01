export function unsafeTarEntry(name: string): boolean {
  if (name.length === 0 || name.includes("\0")) {
    return true;
  }
  if (name.startsWith("/") || name.startsWith("\\") || /^[A-Za-z]:[\\/]/.test(name)) {
    return true;
  }
  return name.split(/[\\/]+/).some((part) => part === "..");
}
