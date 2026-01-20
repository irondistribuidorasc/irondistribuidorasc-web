"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ContaPendentePage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-white px-4 py-16 dark:bg-slate-900">
      <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800">
        <CardBody className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Conta Pendente de Aprovação
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Olá, {session?.user?.name}!
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sua conta foi criada com sucesso, mas está aguardando aprovação
              de um administrador para poder realizar compras.
            </p>
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
              Você será notificado quando sua conta for aprovada.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              as={Link}
              href="/"
              color="primary"
              className="bg-brand-600 text-white"
              size="lg"
            >
              Voltar à Página Inicial
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
