"use client";

import { Button } from "@heroui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      isIconOnly
      variant="light"
      aria-label={`Alternar para tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
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
