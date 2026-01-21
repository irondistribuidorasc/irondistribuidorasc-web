"use client";

import {
	ArchiveBoxIcon,
	ArrowUpTrayIcon,
	ChevronLeftIcon,
	CubeIcon,
	ListBulletIcon,
	PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DeleteAllProductsButton from "@/src/components/admin/DeleteAllProductsButton";
import ProductForm from "@/src/components/admin/ProductForm";
import ProductImport from "@/src/components/admin/ProductImport";
import ProductList from "@/src/components/admin/ProductList";
import StockManager from "@/src/components/admin/StockManager";

export default function AdminProductsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("list");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
			router.push("/");
		}
	}, [status, session, router]);

	if (status === "loading" || status === "unauthenticated") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
				<Spinner size="lg" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Background Pattern */}
			<div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAgMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHptMTggMGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiIGZpbGw9IiM5NDk0YjgiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvZz48L3N2Zz4=')] opacity-60" />

			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				{/* Back Button */}
				<Button
					as={Link}
					href="/admin"
					variant="light"
					className="mb-6 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
				>
					<ChevronLeftIcon className="mr-1 h-4 w-4" />
					Voltar para Dashboard
				</Button>

				{/* Header Card */}
				<Card className="mb-8 overflow-hidden border-0 shadow-xl">
					<div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700">
						{/* Decorative elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl dark:bg-white/5" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl dark:bg-slate-500/10" />
						</div>

						<div className="relative px-6 py-6 sm:px-8">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
										<CubeIcon className="h-7 w-7 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
											Gerenciar Produtos
										</h1>
										<p className="mt-1 text-slate-600 dark:text-slate-300">
											Adicione, edite ou importe produtos em massa
										</p>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-3">
									<DeleteAllProductsButton />
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Navigation Tabs - Compact */}
				<Card className="mb-6 overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
					<CardBody className="p-3">
						<div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-700/50">
							<button
								type="button"
								onClick={() => setActiveTab("list")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									activeTab === "list"
										? "bg-brand-500 text-white shadow-md"
										: "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600"
								}`}
							>
								<ListBulletIcon className="h-4 w-4" />
								<span className="hidden sm:inline">Lista de Produtos</span>
								<span className="sm:hidden">Lista</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("stock")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									activeTab === "stock"
										? "bg-brand-500 text-white shadow-md"
										: "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600"
								}`}
							>
								<ArchiveBoxIcon className="h-4 w-4" />
								<span className="hidden sm:inline">Gerenciar Estoque</span>
								<span className="sm:hidden">Estoque</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("add")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									activeTab === "add"
										? "bg-brand-500 text-white shadow-md"
										: "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600"
								}`}
							>
								<PlusCircleIcon className="h-4 w-4" />
								<span className="hidden sm:inline">Adicionar Produto</span>
								<span className="sm:hidden">Adicionar</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("import")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									activeTab === "import"
										? "bg-brand-500 text-white shadow-md"
										: "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600"
								}`}
							>
								<ArrowUpTrayIcon className="h-4 w-4" />
								<span className="hidden sm:inline">Importar CSV</span>
								<span className="sm:hidden">Importar</span>
							</button>
						</div>
					</CardBody>
				</Card>

				{/* Content */}
				{activeTab === "list" && <ProductList />}
				{activeTab === "stock" && <StockManager />}
				{activeTab === "add" && <ProductForm onSuccess={() => setActiveTab("list")} />}
				{activeTab === "import" && <ProductImport />}
			</div>
		</div>
	);
}
