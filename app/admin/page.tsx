"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Chip } from "@heroui/react";
import {
	ShoppingBagIcon,
	UsersIcon,
	TagIcon,
	BanknotesIcon,
	ArrowTrendingUpIcon,
	SparklesIcon,
	ChevronRightIcon,
	PlusIcon,
	ClockIcon,
	UserPlusIcon,
} from "@heroicons/react/24/outline";
import { 
	ShoppingBagIcon as ShoppingBagSolid,
	UsersIcon as UsersSolid,
	TagIcon as TagSolid,
	BanknotesIcon as BanknotesSolid,
} from "@heroicons/react/24/solid";

export default function AdminDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
			router.push("/");
		}
	}, [status, session, router]);

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	if (status === "loading" || status === "unauthenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<div className="text-center">
					<Spinner size="lg" color="primary" />
					<p className="mt-4 text-sm text-slate-400">Carregando painel...</p>
				</div>
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	const getGreeting = () => {
		const hour = currentTime.getHours();
		if (hour < 12) return "Bom dia";
		if (hour < 18) return "Boa tarde";
		return "Boa noite";
	};

	const menuItems = [
		{
			title: "Gerenciar Pedidos",
			description: "Visualize, edite e atualize o status dos pedidos.",
			icon: ShoppingBagIcon,
			iconSolid: ShoppingBagSolid,
			href: "/admin/pedidos",
			gradient: "from-rose-500 to-red-600",
			shadowColor: "shadow-rose-500/25",
			bgLight: "from-rose-50 to-red-50",
			bgDark: "dark:from-rose-900/20 dark:to-red-900/20",
			borderColor: "border-rose-200 dark:border-rose-800/50",
			badge: "Pedidos",
			badgeColor: "danger",
		},
		{
			title: "Gerenciar Usuários",
			description: "Aprove cadastros e gerencie permissões de usuários.",
			icon: UsersIcon,
			iconSolid: UsersSolid,
			href: "/admin/usuarios",
			gradient: "from-emerald-500 to-teal-600",
			shadowColor: "shadow-emerald-500/25",
			bgLight: "from-emerald-50 to-teal-50",
			bgDark: "dark:from-emerald-900/20 dark:to-teal-900/20",
			borderColor: "border-emerald-200 dark:border-emerald-800/50",
			badge: "Usuários",
			badgeColor: "success",
		},
		{
			title: "Gerenciar Produtos",
			description: "Adicione, edite e controle o estoque de produtos.",
			icon: TagIcon,
			iconSolid: TagSolid,
			href: "/admin/products",
			gradient: "from-violet-500 to-purple-600",
			shadowColor: "shadow-violet-500/25",
			bgLight: "from-violet-50 to-purple-50",
			bgDark: "dark:from-violet-900/20 dark:to-purple-900/20",
			borderColor: "border-violet-200 dark:border-violet-800/50",
			badge: "Produtos",
			badgeColor: "secondary",
		},
		{
			title: "Controle Financeiro",
			description: "Resumo diário de vendas e fechamento de caixa.",
			icon: BanknotesIcon,
			iconSolid: BanknotesSolid,
			href: "/admin/financeiro",
			gradient: "from-amber-500 to-orange-600",
			shadowColor: "shadow-amber-500/25",
			bgLight: "from-amber-50 to-orange-50",
			bgDark: "dark:from-amber-900/20 dark:to-orange-900/20",
			borderColor: "border-amber-200 dark:border-amber-800/50",
			badge: "Finanças",
			badgeColor: "warning",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk0OTQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 dark:opacity-20" />
			
			<div className="relative px-4 py-8 pb-24 md:py-12 md:pb-12">
				<div className="mx-auto w-full max-w-6xl">
					{/* Header Section */}
					<div className="mb-8 md:mb-12">
						{/* Welcome Card */}
						<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-5 shadow-2xl md:rounded-3xl md:p-8 dark:from-slate-800 dark:to-slate-900">
							{/* Decorative Elements */}
							<div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/20 to-red-500/20 blur-3xl" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
							
							<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
								<div>
									<div className="mb-2 flex items-center gap-2">
										<SparklesIcon className="h-5 w-5 text-amber-400" />
										<span className="text-sm font-medium text-amber-400">{getGreeting()}</span>
									</div>
									<h1 className="text-2xl font-bold text-white md:text-4xl">
										Painel Administrativo
									</h1>
									<p className="mt-2 text-slate-400">
										Bem-vindo de volta, <span className="font-semibold text-white">{session.user.name}</span>
									</p>
								</div>
								
								<div className="flex flex-col items-end gap-2">
									<div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
										<p className="text-xs text-slate-400">Hoje é</p>
										<p className="text-lg font-semibold text-white">
											{currentTime.toLocaleDateString('pt-BR', { 
												weekday: 'long', 
												day: 'numeric', 
												month: 'long' 
											})}
										</p>
									</div>
									<div className="flex items-center gap-2 text-sm text-slate-400">
										<ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400" />
										<span>Sistema operacional</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="mb-6">
						<div className="mb-4 flex items-center gap-3">
							<div className="h-1 w-1 rounded-full bg-rose-500" />
							<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
								Ações Rápidas
							</h2>
							<div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
						</div>
						
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => router.push("/admin/pedidos/novo")}
								className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
							>
								<PlusIcon className="h-5 w-5" />
								Novo Pedido
							</button>
							
							<button
								onClick={() => router.push("/admin/pedidos?status=PENDING")}
								className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:shadow-md hover:border-amber-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-amber-600"
							>
								<ClockIcon className="h-5 w-5 text-amber-500" />
								Pedidos Pendentes
							</button>
							
							<button
								onClick={() => router.push("/admin/usuarios?status=PENDING")}
								className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:shadow-md hover:border-emerald-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-600"
							>
								<UserPlusIcon className="h-5 w-5 text-emerald-500" />
								Usuários Aguardando
							</button>
						</div>
					</div>

					{/* Section Title */}
					<div className="mb-6 flex items-center gap-3">
						<div className="h-1 w-1 rounded-full bg-brand-500" />
						<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
							Acesso Rápido
						</h2>
						<div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
					</div>

					{/* Menu Cards Grid */}
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{menuItems.map((item, index) => (
							<Card
								key={item.href}
								className={`group relative h-full cursor-pointer overflow-hidden border-none bg-gradient-to-br ${item.bgLight} ${item.bgDark} shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}
								isPressable
								onPress={() => router.push(item.href)}
								style={{ animationDelay: `${index * 100}ms` }}
							>
								{/* Hover Gradient Overlay */}
								<div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
								
								<CardBody className="relative flex flex-col p-6">
									{/* Icon */}
									<div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadowColor} transition-transform duration-300 group-hover:scale-110`}>
										<item.icon className="h-7 w-7 text-white" />
									</div>
									
									{/* Content */}
									<div className="flex-1">
										<h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">
											{item.title}
										</h3>
										<p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
											{item.description}
										</p>
									</div>
									
									{/* Footer */}
									<div className="mt-5 flex items-center justify-between">
										<Chip
											size="sm"
											variant="flat"
											color={item.badgeColor as "danger" | "success" | "secondary" | "warning"}
											className="font-medium"
										>
											{item.badge}
										</Chip>
										<div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} opacity-0 transition-all duration-300 group-hover:opacity-100`}>
											<ChevronRightIcon className="h-4 w-4 text-white" />
										</div>
									</div>
								</CardBody>
							</Card>
						))}
					</div>

					{/* Quick Stats - Desktop Only (keyboard shortcuts not relevant on mobile) */}
					<div className="mt-12 hidden md:block">
						<div className="mb-6 flex items-center gap-3">
							<div className="h-1 w-1 rounded-full bg-emerald-500" />
							<h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
								Dica Rápida
							</h2>
							<div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
						</div>
						
						<div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
									<SparklesIcon className="h-5 w-5 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-slate-800 dark:text-slate-100">
										Atalho de Teclado
									</h4>
									<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
										Na página de criar pedidos, use <kbd className="mx-1 rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold dark:bg-slate-700">Ctrl</kbd> + <kbd className="mx-1 rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold dark:bg-slate-700">Enter</kbd> para criar o pedido rapidamente.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
