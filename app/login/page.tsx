"use client";

import {
	Button,
	Card,
	CardBody,
	Checkbox,
	Input,
	Skeleton,
	Tab,
	Tabs,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Suspense, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { maskCPFOrCNPJ, maskPhone } from "@/src/lib/masks";
import {
	type LoginSchema,
	loginSchema,
	type RegisterSchema,
	registerSchema,
} from "@/src/lib/schemas";

function LoginPageContent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawCallback = searchParams.get("callbackUrl") ?? "/";
	const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/";
	const [activeTab, setActiveTab] = useState<string | number>(
		searchParams.get("tab") === "register" ? "register" : "login",
	);
	const [isPending, startTransition] = useTransition();

	const {
		register: registerLogin,
		handleSubmit: handleSubmitLogin,
		formState: { errors: loginErrors, isSubmitting: isLoggingIn },
	} = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
	});

	const {
		register: registerRegister,
		handleSubmit: handleSubmitRegister,
		formState: { errors: registerErrors, isSubmitting: isRegistering },
		setValue: setRegisterValue,
		control: registerControl,
	} = useForm<RegisterSchema>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			acceptedTerms: false as unknown as true,
		},
	});

	const acceptedTerms = Boolean(
		useWatch({
			control: registerControl,
			name: "acceptedTerms",
		}),
	);
	const phoneValue = useWatch({
		control: registerControl,
		name: "phone",
	});
	const docNumberValue = useWatch({
		control: registerControl,
		name: "docNumber",
	});

	const isAuthenticated = status === "authenticated" && !!session?.user;

	const redirectAfterAuth = (url?: string | null) => {
		startTransition(() => {
			router.refresh();
			router.push(url ?? callbackUrl);
		});
	};

	async function onLoginSubmit(data: LoginSchema) {
		try {
			const result = await signIn("credentials", {
				email: data.email.trim().toLowerCase(),
				password: data.password,
				redirect: false,
				callbackUrl,
			});

			if (result?.error) {
				toast.error(
					result.error === "CredentialsSignin"
						? "E-mail ou senha inválidos."
						: result.error,
				);
				return;
			}

			toast.success("Login realizado com sucesso!");
			redirectAfterAuth(result?.url);
		} catch {
			toast.error("Ocorreu um erro ao tentar fazer login.");
		}
	}

	async function onRegisterSubmit(data: RegisterSchema) {
		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: data.name.trim(),
					email: data.email.trim().toLowerCase(),
					phone: data.phone?.trim() || null,
					docNumber: data.docNumber?.trim() || null,
					password: data.password,
				}),
			});

			const payload = await response.json().catch(() => ({}));

			if (!response.ok) {
				toast.error(
					payload?.message ?? "Não foi possível completar o cadastro.",
				);
				return;
			}

			toast.success("Cadastro criado! Entrando...");

			const result = await signIn("credentials", {
				email: data.email.trim().toLowerCase(),
				password: data.password,
				redirect: false,
				callbackUrl,
			});

			if (result?.error) {
				toast.error(
					"Cadastro feito, mas não foi possível entrar automaticamente.",
				);
				return;
			}

			redirectAfterAuth(result?.url);
		} catch {
			toast.error("Não foi possível completar o cadastro.");
		}
	}

	if (isAuthenticated) {
		return (
			<section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-b from-background to-content1 px-4 py-16">
				<Card className="w-full max-w-md border border-divider">
					<CardBody className="space-y-6 text-center">
						<div className="space-y-2">
							<p className="text-sm uppercase tracking-[0.3em] text-brand-600">
								Já conectado
							</p>
							<h1 className="text-2xl font-semibold text-foreground">
								Olá, {session.user?.name ?? session.user?.email}
							</h1>
							<p className="text-sm text-default-500">
								Você já pode finalizar seu pedido ou atualizar seus dados.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							<Button
								as={Link}
								href="/pedido"
								color="primary"
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
		<section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-b from-background to-content1 px-4 py-16">
			<Card className="w-full max-w-xl border border-divider shadow-xl">
				<CardBody className="space-y-8">
					<div className="space-y-4 text-center">
						<p className="text-xs uppercase tracking-[0.3em] text-brand-600">
							Acesso rápido
						</p>
						<h1 className="text-3xl font-semibold text-foreground">
							Entrar ou criar conta
						</h1>
						<p className="text-sm text-default-500">
							Use o Google para preencher tudo automaticamente ou faça um
							cadastro rápido.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<Button
							variant="bordered"
							size="lg"
							onPress={() => signIn("google", { callbackUrl })}
							startContent={
								<Image
									src="/brands/google.svg"
									alt="Google"
									width={20}
									height={20}
								/>
							}
						>
							Continuar com Google
						</Button>
						<div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-default-400">
							<span className="h-px flex-1 bg-divider" />
							<span>ou</span>
							<span className="h-px flex-1 bg-divider" />
						</div>
					</div>

					<Tabs
						aria-label="Fluxo de autenticação"
						variant="bordered"
						color="primary"
						selectedKey={activeTab}
						onSelectionChange={setActiveTab}
					>
						<Tab key="login" title="Entrar">
							<form
								className="space-y-4"
								onSubmit={handleSubmitLogin(onLoginSubmit)}
							>
								<Input
									{...registerLogin("email")}
									label="E-mail"
									type="email"
									variant="bordered"
									autoComplete="email"
									isInvalid={!!loginErrors.email}
									errorMessage={loginErrors.email?.message}
								/>
								<Input
									{...registerLogin("password")}
									label="Senha"
									type="password"
									variant="bordered"
									autoComplete="current-password"
									isInvalid={!!loginErrors.password}
									errorMessage={loginErrors.password?.message}
								/>
								<div className="flex justify-end">
									<Link
										href="/recuperar-senha"
										className="text-sm text-brand-600 transition-colors hover:underline dark:text-brand-400"
									>
										Esqueceu a senha?
									</Link>
								</div>
								<Button
									type="submit"
									color="primary"
									className="w-full bg-brand-600 text-white"
									isLoading={isLoggingIn || isPending}
								>
									Entrar
								</Button>
							</form>
						</Tab>
						<Tab key="register" title="Criar conta">
							<form
								className="space-y-4"
								onSubmit={handleSubmitRegister(onRegisterSubmit)}
							>
								<Input
									{...registerRegister("name")}
									label="Nome completo"
									variant="bordered"
									autoComplete="name"
									onKeyDown={(e) => {
										if (e.key === " ") {
											e.nativeEvent.stopPropagation();
										}
									}}
									isInvalid={!!registerErrors.name}
									errorMessage={registerErrors.name?.message}
								/>
								<Input
									{...registerRegister("email")}
									label="E-mail"
									type="email"
									variant="bordered"
									autoComplete="email"
									isInvalid={!!registerErrors.email}
									errorMessage={registerErrors.email?.message}
								/>
								<Input
									{...registerRegister("phone")}
									label="Telefone (opcional)"
									variant="bordered"
									autoComplete="tel"
									isInvalid={!!registerErrors.phone}
									errorMessage={registerErrors.phone?.message}
									onChange={(e) => {
										const masked = maskPhone(e.target.value);
										setRegisterValue("phone", masked);
									}}
									value={phoneValue || ""}
								/>
								<Input
									{...registerRegister("docNumber")}
									label="CPF/CNPJ (opcional)"
									variant="bordered"
									autoComplete="off"
									isInvalid={!!registerErrors.docNumber}
									errorMessage={registerErrors.docNumber?.message}
									onChange={(e) => {
										const masked = maskCPFOrCNPJ(e.target.value);
										setRegisterValue("docNumber", masked);
									}}
									value={docNumberValue || ""}
								/>
								<Input
									{...registerRegister("password")}
									label="Senha"
									type="password"
									variant="bordered"
									autoComplete="new-password"
									isInvalid={!!registerErrors.password}
									errorMessage={registerErrors.password?.message}
								/>
								<Input
									{...registerRegister("confirmPassword")}
									label="Confirmar senha"
									type="password"
									variant="bordered"
									autoComplete="new-password"
									isInvalid={!!registerErrors.confirmPassword}
									errorMessage={registerErrors.confirmPassword?.message}
								/>
								<div className="flex flex-col gap-1">
									<Checkbox
										isSelected={acceptedTerms === true}
										onValueChange={(checked) =>
											setRegisterValue("acceptedTerms", !!checked as true)
										}
										isInvalid={!!registerErrors.acceptedTerms}
										size="sm"
										classNames={{
											label: "text-sm text-default-500",
										}}
									>
										Li e aceito os{" "}
										<Link
											href="/termos-de-uso"
											target="_blank"
											className="text-brand-600 transition-colors hover:underline dark:text-brand-400"
										>
											Termos de Uso
										</Link>{" "}
										e a{" "}
										<Link
											href="/politica-de-privacidade"
											target="_blank"
											className="text-brand-600 transition-colors hover:underline dark:text-brand-400"
										>
											Política de Privacidade
										</Link>
									</Checkbox>
									{registerErrors.acceptedTerms && (
										<p className="text-xs text-danger">
											{registerErrors.acceptedTerms.message}
										</p>
									)}
								</div>
								<Button
									type="submit"
									color="primary"
									className="w-full bg-brand-600 text-white"
									isLoading={isRegistering || isPending}
								>
									Criar conta
								</Button>
							</form>
						</Tab>
					</Tabs>
				</CardBody>
			</Card>
		</section>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<section className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-b from-brand-50 to-background px-4 py-16">
					<Card className="w-full max-w-md border border-divider">
						<CardBody className="space-y-6 p-8">
							<div className="space-y-4 text-center">
								<Skeleton className="mx-auto h-4 w-24 rounded-lg" />
								<Skeleton className="mx-auto h-8 w-48 rounded-lg" />
								<Skeleton className="mx-auto h-4 w-64 rounded-lg" />
							</div>
							<Skeleton className="h-12 w-full rounded-lg" />
							<div className="flex items-center gap-4">
								<Skeleton className="h-px flex-1 rounded" />
								<Skeleton className="h-4 w-8 rounded" />
								<Skeleton className="h-px flex-1 rounded" />
							</div>
							<div className="space-y-4">
								<Skeleton className="h-12 w-full rounded-lg" />
								<Skeleton className="h-12 w-full rounded-lg" />
								<Skeleton className="h-12 w-full rounded-lg" />
							</div>
						</CardBody>
					</Card>
				</section>
			}
		>
			<LoginPageContent />
		</Suspense>
	);
}
