import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryNavigation } from "../CategoryNavigation";

let pathname = "/produtos";
let currentCategory: string | null = null;

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
  usePathname: () => pathname,
  useSearchParams: () => ({
    get: (key: string) => (key === "category" ? currentCategory : null),
  }),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  pathname = "/produtos";
  currentCategory = null;
});

describe("CategoryNavigation", () => {
  it("expõe uma navegação nomeada e destaca Todos Produtos quando não há categoria ativa", () => {
    render(<CategoryNavigation />);

    expect(
      screen.getByRole("navigation", { name: "Categorias de produtos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Todos Produtos" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("destaca a categoria ativa pela querystring", () => {
    currentCategory = "charging_flex";

    render(<CategoryNavigation />);

    expect(screen.getByRole("link", { name: "Flex de Carga" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Todos Produtos" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("renderiza a categoria Lente com o slug lens", () => {
    render(<CategoryNavigation />);

    expect(
      screen
        .getAllByRole("link", { name: "Lente" })
        .some((link) => link.getAttribute("href") === "/produtos?category=lens"),
    ).toBe(true);
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
