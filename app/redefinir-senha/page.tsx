"use client";

import {
  type ResetPasswordSchema,
  resetPasswordSchema,
} from "@/src/lib/schemas";
import { MIN_PASSWORD_LENGTH } from "@/src/lib/validation";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-error-600 dark:text-error-400">
          Token inválido ou ausente.
        </p>
        <Button as={Link} href="/recuperar-senha" variant="bordered">
          Solicitar novo link
        </Button>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordSchema) {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Erro ao redefinir senha.");
      }

      setIsSuccess(true);
      setSuccessMessage(payload.message);
      toast.success("Senha redefinida com sucesso!");

      // Redirecionar após alguns segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro. Tente novamente.");
      }
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          {successMessage}
        </div>
        <p className="text-sm text-slate-600">
          Você será redirecionado para o login em instantes...
        </p>
        <Button as={Link} href="/login" color="primary" className="w-full">
          Ir para o login agora
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        {...register("newPassword")}
        label={`Nova senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
        type="password"
        variant="bordered"
        autoComplete="new-password"
        isInvalid={!!errors.newPassword}
        errorMessage={errors.newPassword?.message}
      />
      <Input
        {...register("confirmPassword")}
        label="Confirmar nova senha"
        type="password"
        variant="bordered"
        autoComplete="new-password"
        isInvalid={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        color="primary"
        className="w-full bg-brand-600 text-white"
        isLoading={isSubmitting}
      >
        Redefinir Senha
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-white px-4 py-16 dark:bg-slate-900">
      <Card className="w-full max-w-md border border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <CardBody className="space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Redefinir Senha
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Crie uma nova senha segura para sua conta.
            </p>
          </div>

          <Suspense fallback={<div className="text-center">Carregando...</div>}>
            <ResetPasswordContent />
          </Suspense>
        </CardBody>
      </Card>
    </section>
  );
}
