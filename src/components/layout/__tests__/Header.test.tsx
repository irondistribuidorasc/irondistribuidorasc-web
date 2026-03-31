import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Header } from "../Header";

const mockUseCart = vi.fn(() => ({
  totalItems: 0,
  isCartOpen: false,
  openCart: vi.fn(),
  closeCart: vi.fn(),
}));

const mockUseNotification = vi.fn(() => ({
  unreadCount: 0,
}));

const mockUseSession = vi.fn(() => ({
  status: "authenticated",
  data: {
    user: {
      name: "Admin",
      email: "admin@iron.test",
      role: "ADMIN",
    },
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

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: ComponentProps<"img">) => <div aria-label={alt} data-next-image="true" {...props} />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/produtos",
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: () => mockUseSession(),
}));

vi.mock("@/src/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

vi.mock("@/src/contexts/NotificationContext", () => ({
  useNotification: () => mockUseNotification(),
}));

vi.mock("@/src/components/layout/GlobalSearch", () => ({
  GlobalSearch: () => <div>Busca global</div>,
}));

vi.mock("@/src/components/layout/MobileMenu", () => ({
  MobileMenu: () => <div>Menu mobile</div>,
}));

vi.mock("@/src/components/cart/CartDrawer", () => ({
  CartDrawer: () => <div>Carrinho</div>,
}));

vi.mock("@/src/components/ui/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

vi.mock("@/src/components/admin/NotificationBell", () => ({
  default: () => <div>Notificações admin</div>,
}));

vi.mock("@/src/components/layout/CustomerNotificationBell", () => ({
  default: () => <div>Notificações cliente</div>,
}));

vi.mock("@heroui/react", () => {
  const Button = ({
    children,
    as,
    href,
    onPress,
    isIconOnly,
    ...props
  }: {
    children?: ReactNode;
    as?: unknown;
    href?: string;
    onPress?: () => void;
    isIconOnly?: boolean;
  }) => {
    void isIconOnly;

    if (as) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }

    return (
      <button type="button" onClick={onPress} {...props}>
        {children}
      </button>
    );
  };

  const Div = ({
    children,
    maxWidth,
    justify,
    position,
    placement,
    variant,
    ...props
  }: {
    children?: ReactNode;
    maxWidth?: string;
    justify?: string;
    position?: string;
    placement?: string;
    variant?: string;
  }) => {
    void maxWidth;
    void justify;
    void position;
    void placement;
    void variant;
    return <div {...props}>{children}</div>;
  };

  return {
    Avatar: ({
      isBordered,
      ...props
    }: Record<string, unknown> & { isBordered?: boolean }) => {
      void isBordered;
      return <button type="button" {...props} />;
    },
    Badge: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Button,
    Dropdown: Div,
    DropdownItem: ({
      children,
      href,
      onPress,
      ...props
    }: {
      children?: ReactNode;
      href?: string;
      onPress?: () => void;
    }) =>
      href ? (
        <a href={href} {...props}>
          {children}
        </a>
      ) : (
        <button type="button" onClick={onPress} {...props}>
          {children}
        </button>
      ),
    DropdownMenu: Div,
    DropdownTrigger: Div,
    Navbar: Div,
    NavbarBrand: Div,
    NavbarContent: Div,
    NavbarItem: Div,
  };
});

afterEach(() => {
  cleanup();
});

describe("Header", () => {
  it("mantém a faixa de categorias exposta no mobile", () => {
    render(<Header />);

    expect(screen.getByTestId("category-subheader")).not.toHaveClass("hidden");
    expect(
      screen.getByRole("navigation", { name: "Categorias de produtos" }),
    ).toBeInTheDocument();
  });

  it("mantém Administração fora da navegação de categorias", () => {
    render(<Header />);

    const categoriesNavigation = screen.getByRole("navigation", {
      name: "Categorias de produtos",
    });
    const adminLink = screen.getByRole("link", { name: "Administração" });

    expect(categoriesNavigation).not.toContainElement(adminLink);
  });
});
