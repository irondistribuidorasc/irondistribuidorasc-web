"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Necessário para evitar problemas de hidratação com next-themes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = resolvedTheme ?? "light";
  const isDark = currentTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      isIconOnly
      variant="light"
      aria-label={`Alternar para tema ${
        nextTheme === "dark" ? "escuro" : "claro"
      }`}
      title={`Alternar para tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      onPress={() => setTheme(nextTheme)}
    >
      {isDark ? (
        <SunIcon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
      ) : (
        <MoonIcon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
      )}
    </Button>
  );
}
