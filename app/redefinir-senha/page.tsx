"use client";

import { MIN_PASSWORD_LENGTH } from "@/src/lib/validation";
import { Button, Card, CardBody, Input } from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-red-600">Token inválido ou ausente.</p>
        <Button as={Link} href="/recuperar-senha" variant="bordered">
          Solicitar novo link
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("As senhas não coincidem.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao redefinir senha.");
      }

      setStatus("success");
      setMessage(data.message);

      // Redirecionar após alguns segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Ocorreu um erro. Tente novamente.");
      }
    }
  }

  if (status === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          {message}
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={`Nova senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        variant="bordered"
        value={newPassword}
        onValueChange={setNewPassword}
        autoComplete="new-password"
      />
      <Input
        label="Confirmar nova senha"
        type="password"
        required
        variant="bordered"
        value={confirmPassword}
        onValueChange={setConfirmPassword}
        autoComplete="new-password"
        isInvalid={
          confirmPassword.length > 0 && newPassword !== confirmPassword
        }
        errorMessage={
          confirmPassword.length > 0 && newPassword !== confirmPassword
            ? "As senhas não coincidem."
            : undefined
        }
      />

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      )}

      <Button
        type="submit"
        color="danger"
        className="w-full bg-brand-600 text-white"
        isLoading={status === "loading"}
        isDisabled={
          !newPassword ||
          newPassword.length < MIN_PASSWORD_LENGTH ||
          newPassword !== confirmPassword
        }
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
