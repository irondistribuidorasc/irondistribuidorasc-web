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
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DeleteAllProductsButton from "@/src/components/admin/DeleteAllProductsButton";

const ProductForm = dynamic(() => import("@/src/components/admin/ProductForm"), {
	loading: () => <div className="flex justify-center py-16"><Spinner size="lg" /></div>,
});
const ProductImport = dynamic(() => import("@/src/components/admin/ProductImport"), {
	loading: () => <div className="flex justify-center py-16"><Spinner size="lg" /></div>,
});
const ProductList = dynamic(() => import("@/src/components/admin/ProductList"), {
	loading: () => <div className="flex justify-center py-16"><Spinner size="lg" /></div>,
});
const StockManager = dynamic(() => import("@/src/components/admin/StockManager"), {
	loading: () => <div className="flex justify-center py-16"><Spinner size="lg" /></div>,
});

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
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-default-50 via-background to-default-100">
				<Spinner size="lg" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-default-50 via-background to-default-100">
			<div className="fixed inset-0 -z-10 bg-[url('/patterns/dots.svg')] opacity-60" />

			<div className="mx-auto w-full max-w-6xl px-4 py-8">
				{/* Back Button */}
				<Button
					as={Link}
					href="/admin"
					variant="light"
					className="mb-6 -ml-2 text-default-400 hover:text-foreground transition-colors"
				>
					<ChevronLeftIcon className="mr-1 h-4 w-4" />
					Voltar para Dashboard
				</Button>

				{/* Header Card */}
				<Card className="mb-8 overflow-hidden border-0 shadow-xl">
					<div className="relative bg-gradient-to-r from-default-100 via-content1 to-default-100">
						{/* Decorative elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl dark:bg-white/5" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl dark:bg-default-400/10" />
						</div>

						<div className="relative px-6 py-6 sm:px-8">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
										<CubeIcon className="h-7 w-7 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-foreground sm:text-3xl">
											Gerenciar Produtos
										</h1>
										<p className="mt-1 text-default-500">
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
				<Card className="mb-6 overflow-hidden border-0 shadow-lg bg-background/80 backdrop-blur-sm">
					<CardBody className="p-3">
						<div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-default-100">
							<button
								type="button"
								onClick={() => setActiveTab("list")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									activeTab === "list"
										? "bg-brand-500 text-white shadow-md"
										: "text-default-500 hover:bg-default-200"
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
										: "text-default-500 hover:bg-default-200"
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
										: "text-default-500 hover:bg-default-200"
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
										: "text-default-500 hover:bg-default-200"
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
