"use client";

import { NewOrderForm } from "./new-order-form";
import Link from "next/link";
import { Button } from "@heroui/react";
import { ArrowLeftIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export default function NewOrderPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              <PlusCircleIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              Novo Pedido Manual
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Crie um pedido manualmente para um cliente existente
            </p>
          </div>
          <Button
            as={Link}
            href="/admin/pedidos"
            variant="flat"
            className="font-medium"
            startContent={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Voltar para Pedidos
          </Button>
        </div>

        {/* Form */}
        <NewOrderForm />
      </div>
    </div>
  );
}
