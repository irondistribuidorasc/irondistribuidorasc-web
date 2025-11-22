"use client";

import { MIN_PASSWORD_LENGTH } from "@/src/lib/validation";
import { Button, Card, CardBody, Input, Tab, Tabs } from "@heroui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

function LoginPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerDoc, setRegisterDoc] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const redirectAfterAuth = (url?: string | null) => {
    router.push(url ?? callbackUrl);
    router.refresh();
  };

  async function handleCredentialLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const result = await signIn("credentials", {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setLoginError(
          result.error === "CredentialsSignin"
            ? "E-mail ou senha inválidos."
            : result.error
        );
        return;
      }

      redirectAfterAuth(result?.url);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    // Validação de senhas iguais
    if (registerPassword !== registerPasswordConfirm) {
      setRegisterError("As senhas não coincidem.");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim().toLowerCase(),
          phone: registerPhone.trim() || null,
          docNumber: registerDoc.trim() || null,
          password: registerPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setRegisterError(
          payload?.message ?? "Não foi possível completar o cadastro."
        );
        return;
      }

      setRegisterSuccess("Cadastro criado! Entrando...");

      const result = await signIn("credentials", {
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setRegisterError(
          "Cadastro feito, mas não foi possível entrar automaticamente."
        );
        return;
      }

      redirectAfterAuth(result?.url);
    } catch {
      // Erro capturado no cliente - mensagem genérica para o usuário
      setRegisterError("Não foi possível completar o cadastro.");
    } finally {
      setIsRegistering(false);
    }
  }

  if (isAuthenticated) {
    return (
      <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-white px-4 py-16 dark:bg-slate-900">
        <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800">
          <CardBody className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-600">
                Já conectado
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Olá, {session.user?.name ?? session.user?.email}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Você já pode finalizar seu pedido ou atualizar seus dados.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                as={Link}
                href="/pedido"
                color="danger"
                className="bg-brand-600 text-white"
                size="lg"
              >
                Ir para pedidos
              </Button>
              <Button
                variant="bordered"
                onPress={() => signOut({ callbackUrl: "/" })}
              >
                Sair
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-white px-4 py-16 dark:bg-slate-900">
      <Card className="w-full max-w-xl border border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <CardBody className="space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
              Acesso rápido
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Entrar ou criar conta
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use o Google para preencher tudo automaticamente ou faça um
              cadastro rápido.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="bordered"
              size="lg"
              onPress={() => signIn("google", { callbackUrl })}
            >
              Continuar com Google
            </Button>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span>ou</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <Tabs
            aria-label="Fluxo de autenticação"
            variant="bordered"
            color="danger"
          >
            <Tab key="login" title="Entrar">
              <form className="space-y-4" onSubmit={handleCredentialLogin}>
                <Input
                  label="E-mail"
                  type="email"
                  required
                  variant="bordered"
                  value={loginEmail}
                  onValueChange={setLoginEmail}
                  autoComplete="email"
                />
                <Input
                  label="Senha"
                  type="password"
                  required
                  variant="bordered"
                  value={loginPassword}
                  onValueChange={setLoginPassword}
                  autoComplete="current-password"
                />
                {loginError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {loginError}
                  </p>
                )}
                <Button
                  type="submit"
                  color="danger"
                  className="w-full bg-brand-600 text-white"
                  isLoading={isLoggingIn}
                  isDisabled={!loginEmail || !loginPassword}
                >
                  Entrar
                </Button>
              </form>
            </Tab>
            <Tab key="register" title="Criar conta">
              <form className="space-y-4" onSubmit={handleRegister}>
                <Input
                  label="Nome completo"
                  required
                  variant="bordered"
                  value={registerName}
                  onValueChange={setRegisterName}
                  autoComplete="name"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.nativeEvent.stopPropagation();
                    }
                  }}
                />
                <Input
                  label="E-mail"
                  type="email"
                  required
                  variant="bordered"
                  value={registerEmail}
                  onValueChange={setRegisterEmail}
                  autoComplete="email"
                />
                <Input
                  label="Telefone (opcional)"
                  variant="bordered"
                  value={registerPhone}
                  onValueChange={setRegisterPhone}
                  autoComplete="tel"
                />
                <Input
                  label="CPF/CNPJ (opcional)"
                  variant="bordered"
                  value={registerDoc}
                  onValueChange={setRegisterDoc}
                  autoComplete="off"
                />
                <Input
                  label={`Senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  variant="bordered"
                  value={registerPassword}
                  onValueChange={setRegisterPassword}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar senha"
                  type="password"
                  required
                  variant="bordered"
                  value={registerPasswordConfirm}
                  onValueChange={setRegisterPasswordConfirm}
                  autoComplete="new-password"
                  isInvalid={
                    registerPasswordConfirm.length > 0 &&
                    registerPassword !== registerPasswordConfirm
                  }
                  errorMessage={
                    registerPasswordConfirm.length > 0 &&
                    registerPassword !== registerPasswordConfirm
                      ? "As senhas não coincidem."
                      : undefined
                  }
                />
                {registerError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {registerError}
                  </p>
                )}
                {registerSuccess && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {registerSuccess}
                  </p>
                )}
                <Button
                  type="submit"
                  color="danger"
                  className="w-full bg-brand-600 text-white"
                  isLoading={isRegistering}
                  isDisabled={
                    !registerName ||
                    !registerEmail ||
                    registerPassword.length < MIN_PASSWORD_LENGTH ||
                    registerPassword !== registerPasswordConfirm
                  }
                >
                  Criar conta
                </Button>
              </form>
            </Tab>
          </Tabs>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Ao continuar você concorda com nossos termos de uso e política de
            privacidade.
          </p>
        </CardBody>
      </Card>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-16 dark:from-slate-900 dark:to-slate-950">
          <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800">
            <CardBody className="space-y-6 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Carregando...
              </p>
            </CardBody>
          </Card>
        </section>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
