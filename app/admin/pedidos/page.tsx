import { Spinner } from "@heroui/react";
import { Suspense } from "react";
import { AdminPedidosContent } from "./AdminPedidosContent";

function LoadingFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			<div className="text-center">
				<Spinner size="lg" color="primary" />
				<p className="mt-4 text-sm text-slate-400">Carregando pedidos...</p>
			</div>
		</div>
	);
}

export default function AdminPedidosPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<AdminPedidosContent />
		</Suspense>
	);
}
