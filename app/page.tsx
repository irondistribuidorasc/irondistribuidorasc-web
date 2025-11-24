"use client";

import { WhatsAppFloatingButton } from "@/src/components/ui/WhatsAppFloatingButton";
import { categoryOptions } from "@/src/data/products";
import { Button, Card, CardBody } from "@heroui/react";
// import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-20">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-col items-center gap-4 md:items-start">
              {/* <Image
                src="/logo-iron.png"
                alt="B2B Template"
                width={96}
                height={96}
                className="h-20 w-20 rounded-full object-cover shadow-lg shadow-brand-600/20"
              /> */}
              <p className="text-xs uppercase tracking-[0.2em] text-brand-600">
                {process.env.NEXT_PUBLIC_APP_NAME || "B2B Template"}
              </p>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl md:text-5xl">
              Sua Distribuidora de Confiança
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Solução completa para vendas B2B. Gerencie seu catálogo, pedidos e clientes em um só lugar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button
                as={Link}
                href="/produtos"
                size="lg"
                color="danger"
                className="bg-brand-600 hover:bg-brand-700 !text-white"
              >
                Fazer pedido de peças
              </Button>
              <Button
                as={Link}
                href="/garantia"
                size="lg"
                variant="bordered"
                color="danger"
              >
                Solicitar garantia / troca
              </Button>
            </div>
            <div className="rounded-lg border border-brand-100 bg-white/80 p-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                Fale Conosco
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atendimento dedicado para parceiros.
              </p>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-brand-600/10 dark:border-slate-800 dark:bg-slate-900">
              {/* <Image
                src="/logo-iron.png"
                alt="B2B Template"
                width={160}
                height={160}
                className="mx-auto h-40 w-40 rounded-full object-cover"
              /> */}
              <div className="mx-auto h-40 w-40 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 <span className="text-4xl">📦</span>
              </div>
              <p className="mt-6 text-center text-sm font-medium uppercase tracking-[0.3em] text-brand-600">
                Qualidade Garantida
              </p>
              <p className="mt-2 text-center text-base text-slate-600 dark:text-slate-400">
                Gerencie seu estoque e pedidos com eficiência e rapidez.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
              Categorias em Destaque
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Explore nosso catálogo de produtos.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categoryOptions.map((category) => (
              <Card
                key={category.key}
                className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <CardBody className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {category.label}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {category.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppFloatingButton />
    </div>
  );
}
