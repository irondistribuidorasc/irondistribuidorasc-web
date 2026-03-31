/* eslint-disable @next/next/no-img-element */

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import HomePageClient from "@/app/HomePageClient";
import { categoryOptions } from "@/src/data/products";

vi.mock("next/image", () => ({
  default: (props: {
    alt: string;
    fill?: boolean;
    src: string;
  }) => {
    const { alt, fill, src, ...rest } = props;
    void fill;

    return <img alt={alt} src={src} {...rest} />;
  },
}));

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

vi.mock("@/src/components/produtos/ProductCard", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div>{product.name}</div>
  ),
}));

vi.mock("@/src/components/ui/ClientOnly", () => ({
  ClientOnly: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/src/components/ui/ScrollAnimation", () => ({
  ScrollAnimation: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("@/src/components/ui/WhatsAppFloatingButton", () => ({
  WhatsAppFloatingButton: () => null,
}));

vi.mock("@heroui/react", () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AccordionItem: ({
    children,
    title,
  }: {
    children: ReactNode;
    title: string;
  }) => (
    <section>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  ),
  Avatar: ({ name }: { name: string }) => <div>{name}</div>,
  Button: (props: {
    as?: unknown;
    children: ReactNode;
  }) => {
    const { as, children, ...rest } = props;
    void as;

    return <button {...rest}>{children}</button>;
  },
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("HomePageClient", () => {
  it("renderiza as novas categorias sem quebrar a home", () => {
    render(<HomePageClient />);

    const newCategoryLabels = categoryOptions
      .filter((category) =>
        [
          "charging_flex",
          "charging_connector",
          "lcd_flex",
          "power_flex",
          "front_camera",
          "rear_camera",
        ].includes(category.key),
      )
      .map((category) => category.label);

    newCategoryLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
