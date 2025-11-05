"use client";

import { PedidoWizard } from "@/src/components/pedido/PedidoWizard";
import { Skeleton } from "@heroui/react";
import { Suspense } from "react";

// export const metadata = {
//   title: "Fazer pedido de peças | IRON DISTRIBUIDORA SC",
//   description:
//     "Monte seu pedido de peças de celular por tipo e marca, finalize diretamente pelo WhatsApp da IRON DISTRIBUIDORA SC.",
// };

export default function PedidoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
          Pedido online
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Faça seu pedido de peças
        </h1>
        <p className="text-sm text-slate-500">
          Siga os passos para selecionar peças, revisar o carrinho e finalizar o
          pedido via WhatsApp.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        }
      >
        <PedidoWizard />
      </Suspense>
    </div>
  );
}
