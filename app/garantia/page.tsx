import { GarantiaWizard } from "@/src/components/garantia/GarantiaWizard";
import { GarantiaLoadingSkeleton } from "@/src/components/ui/GarantiaLoadingSkeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Solicitar garantia ou troca | IRON DISTRIBUIDORA SC",
  description:
    "Abra solicitações de garantia ou troca com a IRON DISTRIBUIDORA SC e gere a mensagem pronta para o WhatsApp.",
};

export default function GarantiaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          <ShieldCheckIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          Garantia e Troca
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Solicite garantia ou devolução de produtos e gere a mensagem
          automática para WhatsApp
        </p>
      </div>
      <Suspense fallback={<GarantiaLoadingSkeleton />}>
        <GarantiaWizard />
      </Suspense>
    </div>
  );
}
