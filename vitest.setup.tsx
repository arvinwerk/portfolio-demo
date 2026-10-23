import "@testing-library/jest-dom/vitest";
import type { AnchorHTMLAttributes } from "react";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    scroll: _scroll,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; scroll?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
