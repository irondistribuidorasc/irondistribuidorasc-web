"use client";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import Link from "next/link";

interface OrderConfirmationContentProps {
  orderNumber: string;
}

export function OrderConfirmationContent({
  orderNumber,
}: OrderConfirmationContentProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
        <CheckCircleIcon className="h-16 w-16 text-green-600 dark:text-green-400" />
      </div>

      <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Obrigado pelo seu pedido!
      </h1>

      <p className="mb-8 max-w-md text-slate-600 dark:text-slate-400">
        Seu pedido{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          #{orderNumber}
        </span>{" "}
        foi realizado com sucesso. Você receberá atualizações sobre o status do
        seu pedido.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          as={Link}
          href="/meus-pedidos"
          color="primary"
          size="lg"
          className="font-medium"
        >
          Acompanhar meus pedidos
        </Button>

        <Button
          as={Link}
          href="/"
          variant="bordered"
          size="lg"
          className="font-medium"
        >
          Voltar para a loja
        </Button>
      </div>
    </div>
  );
}
