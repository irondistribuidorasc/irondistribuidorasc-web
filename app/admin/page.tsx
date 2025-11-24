"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import Link from "next/link";
import {
	ShoppingBagIcon,
	UsersIcon,
	TagIcon,
	BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
			router.push("/");
		}
	}, [status, session, router]);

	if (status === "loading" || status === "unauthenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	const menuItems = [
		{
			title: "Gerenciar Pedidos",
			description: "Visualize, edite e atualize o status dos pedidos.",
			icon: ShoppingBagIcon,
			href: "/admin/pedidos",
			color: "bg-blue-500",
		},
		{
			title: "Gerenciar Usuários",
			description: "Aprove cadastros e gerencie permissões de usuários.",
			icon: UsersIcon,
			href: "/admin/usuarios",
			color: "bg-green-500",
		},
		{
			title: "Gerenciar Produtos",
			description: "Adicione, edite e controle o estoque de produtos.",
			icon: TagIcon,
			href: "/admin/products",
			color: "bg-purple-500",
		},
		{
			title: "Controle Financeiro",
			description: "Resumo diário de vendas e fechamento de caixa.",
			icon: BanknotesIcon,
			href: "/admin/financeiro",
			color: "bg-orange-500",
		},
	];

	return (
		<div className="min-h-screen bg-white px-4 py-12 dark:bg-slate-900">
			<div className="mx-auto w-full max-w-6xl">
				<div className="mb-12">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
						Painel Administrativo
					</h1>
					<p className="mt-2 text-slate-600 dark:text-slate-400">
						Bem-vindo, {session.user.name}. Selecione uma opção abaixo.
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{menuItems.map((item) => (
						<Link key={item.href} href={item.href} className="block h-full">
							<Card
								className="h-full border border-slate-200 transition-all hover:scale-[1.02] hover:shadow-lg dark:border-slate-800"
								isPressable
							>
								<CardBody className="flex flex-col items-center p-8 text-center">
									<div
										className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${item.color} text-white shadow-md`}
									>
										<item.icon className="h-8 w-8" />
									</div>
									<h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
										{item.title}
									</h2>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										{item.description}
									</p>
								</CardBody>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
