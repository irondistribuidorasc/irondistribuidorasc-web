"use client";

import { Button, Card, CardBody, Input } from "@heroui/react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao enviar solicitação.");
      }

      setStatus("success");
      setMessage(data.message);
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Ocorreu um erro. Tente novamente.");
      }
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-white px-4 py-16 dark:bg-slate-900">
      <Card className="w-full max-w-md border border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <CardBody className="space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Recuperar Senha
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Digite seu e-mail para receber um link de redefinição de senha.
            </p>
          </div>

          {status === "success" ? (
            <div className="space-y-6 text-center">
              <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                {message}
              </div>
              <p className="text-xs text-slate-500">
                Verifique sua caixa de entrada (e spam). O link expira em 1
                hora.
              </p>
              <Button
                as={Link}
                href="/login"
                variant="bordered"
                className="w-full"
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="E-mail"
                type="email"
                required
                variant="bordered"
                value={email}
                onValueChange={setEmail}
                autoComplete="email"
                isDisabled={status === "loading"}
              />

              {status === "error" && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {message}
                </p>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  color="danger"
                  className="w-full bg-brand-600 text-white"
                  isLoading={status === "loading"}
                  isDisabled={!email}
                >
                  Enviar link de recuperação
                </Button>
                <Button
                  as={Link}
                  href="/login"
                  variant="light"
                  className="w-full"
                  isDisabled={status === "loading"}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
