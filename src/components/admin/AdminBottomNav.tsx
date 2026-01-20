"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import {
  ShoppingBagIcon as ShoppingBagSolid,
  UsersIcon as UsersSolid,
  TagIcon as TagSolid,
  BanknotesIcon as BanknotesSolid,
} from "@heroicons/react/24/solid";

const navItems = [
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: ShoppingBagIcon,
    iconActive: ShoppingBagSolid,
    color: "text-brand-500",
    bgColor: "bg-brand-500/10",
  },
  {
    href: "/admin/usuarios",
    label: "Usuários",
    icon: UsersIcon,
    iconActive: UsersSolid,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    href: "/admin/products",
    label: "Produtos",
    icon: TagIcon,
    iconActive: TagSolid,
    color: "text-brand-500",
    bgColor: "bg-brand-500/10",
  },
  {
    href: "/admin/financeiro",
    label: "Finanças",
    icon: BanknotesIcon,
    iconActive: BanknotesSolid,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  // Não exibir em rotas de impressão
  const isPrintRoute = pathname?.includes("/print");
  if (isPrintRoute) {
    return null;
  }

  // Check if current path matches or starts with the nav item href
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg print:hidden md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = active ? item.iconActive : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ${
                active
                  ? `${item.bgColor} ${item.color}`
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-slate-900/95" />
    </nav>
  );
}
