"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useCallback } from "react";

const COOKIE_CONSENT_KEY = "iron-cookie-consent";

type ConsentType = "all" | "essential" | null;

// Store para sincronizar com localStorage
function getConsentSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function getConsentServerSnapshot(): string | null {
  return null; // Server sempre retorna null
}

function subscribeToConsent(callback: () => void): () => void {
  // Escuta por mudanças no localStorage (de outras abas)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === COOKIE_CONSENT_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function CookieConsent() {
  const pathname = usePathname();
  
  // Usar useSyncExternalStore para sincronizar com localStorage sem causar cascata de renders
  const savedConsent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  // Não exibir em rotas de impressão
  const isPrintRoute = pathname?.includes("/print");
  const showBanner = savedConsent === null && !isPrintRoute;

  const saveConsent = useCallback((type: ConsentType) => {
    const consent = {
      type,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    // Disparar evento de storage para atualizar o componente
    window.dispatchEvent(new StorageEvent("storage", { key: COOKIE_CONSENT_KEY }));
  }, []);

  // Não renderiza no servidor ou se já consentiu
  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)] print:hidden dark:bg-slate-900/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              Utilizamos cookies
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Usamos cookies para melhorar sua experiência de navegação,
              personalizar conteúdo e analisar nosso tráfego. Ao clicar em
              &quot;Aceitar todos&quot;, você concorda com o uso de todos os
              cookies. Leia nossa{" "}
              <Link
                href="/politica-de-privacidade"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Política de Privacidade
              </Link>{" "}
              para mais informações.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="bordered"
              size="sm"
              onPress={() => saveConsent("essential")}
              className="w-full sm:w-auto"
            >
              Apenas essenciais
            </Button>
            <Button
              color="danger"
              size="sm"
              onPress={() => saveConsent("all")}
              className="w-full bg-brand-600 text-white sm:w-auto"
            >
              Aceitar todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook para verificar o consentimento de cookies
 * Útil para condicionar o carregamento de scripts de analytics
 */
export function useCookieConsent() {
  const savedConsent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  let consent: ConsentType = null;
  if (savedConsent) {
    try {
      const parsed = JSON.parse(savedConsent);
      consent = parsed.type;
    } catch {
      consent = null;
    }
  }

  return {
    hasConsent: consent !== null,
    consentType: consent,
    hasAnalyticsConsent: consent === "all",
  };
}
