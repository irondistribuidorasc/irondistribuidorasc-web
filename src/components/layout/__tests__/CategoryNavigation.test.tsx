import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { CategoryNavigation } from "../CategoryNavigation";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/produtos",
  useSearchParams: () => ({
    get: () => null,
  }),
}));

describe("CategoryNavigation", () => {
  it("renderiza a categoria Lente com o slug lens", () => {
    render(<CategoryNavigation />);

    expect(screen.getByRole("link", { name: "Lente" })).toHaveAttribute(
      "href",
      "/produtos?category=lens",
    );
  });

  it("renderiza a nova categoria Flex de Carga com o slug charging_flex", () => {
    render(<CategoryNavigation />);

    const links = screen.getAllByRole("link", { name: "Flex de Carga" });

    expect(
      links.some(
        (link) => link.getAttribute("href") === "/produtos?category=charging_flex",
      ),
    ).toBe(true);
  });
});
