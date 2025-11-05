"use client";

import { GarantiaWizard } from "@/src/components/garantia/GarantiaWizard";
import { Skeleton } from "@heroui/react";
import { Suspense } from "react";

// export const metadata = {
//   title: "Solicitar garantia ou troca | IRON DISTRIBUIDORA SC",
//   description:
//     "Abra solicitações de garantia ou troca com a IRON DISTRIBUIDORA SC e gere a mensagem pronta para o WhatsApp.",
// };

export default function GarantiaPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
          Garantia e troca
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Solicite sua garantia
        </h1>
        <p className="text-sm text-slate-500">
          Siga os passos para detalhar o item, anexar fotos e gerar a mensagem
          de atendimento automático no WhatsApp.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        }
      >
        <GarantiaWizard />
      </Suspense>
    </div>
  );
}
