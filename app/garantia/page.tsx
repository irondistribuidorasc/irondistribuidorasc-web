import { GarantiaWizard } from "@/src/components/garantia/GarantiaWizard";
import { GarantiaLoadingSkeleton } from "@/src/components/ui/GarantiaLoadingSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Solicitar garantia ou troca | IRON DISTRIBUIDORA SC",
  description:
    "Abra solicitações de garantia ou troca com a IRON DISTRIBUIDORA SC e gere a mensagem pronta para o WhatsApp.",
};

export default function GarantiaPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
          Garantia e troca
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Solicite sua garantia
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Siga os passos para detalhar o item, anexar fotos e gerar a mensagem
          de atendimento automático no WhatsApp.
        </p>
      </div>
      <Suspense fallback={<GarantiaLoadingSkeleton />}>
        <GarantiaWizard />
      </Suspense>
    </div>
  );
}
