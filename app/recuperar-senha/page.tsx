"use client";

import {
  type ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/src/lib/schemas";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordSchema) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Erro ao enviar solicitação.");
      }

      setIsSuccess(true);
      setSuccessMessage(payload.message);
      toast.success("E-mail de recuperação enviado!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro. Tente novamente.");
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

          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                {successMessage}
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                {...register("email")}
                label="E-mail"
                type="email"
                variant="bordered"
                autoComplete="email"
                isDisabled={isSubmitting}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />

              <div className="space-y-3">
                <Button
                  type="submit"
                  color="danger"
                  className="w-full bg-brand-600 text-white"
                  isLoading={isSubmitting}
                >
                  Enviar link de recuperação
                </Button>
                <Button
                  as={Link}
                  href="/login"
                  variant="light"
                  className="w-full"
                  isDisabled={isSubmitting}
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
