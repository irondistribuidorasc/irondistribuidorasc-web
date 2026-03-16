"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { FeedbacksContent } from "./FeedbacksContent";

export default function AdminFeedbacksPage() {
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
				<Spinner size="lg" color="primary" />
			</div>
		);
	}

	if (session?.user?.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-content1 via-background to-default-100">
			<div className="px-4 py-8 pb-24 md:py-12 md:pb-12">
				<div className="mx-auto w-full max-w-6xl">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
								<StarIcon className="h-6 w-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-foreground">
									Avaliações de Pedidos
								</h1>
								<p className="text-sm text-default-500">
									Acompanhe o feedback dos clientes sobre os pedidos entregues
								</p>
							</div>
						</div>
					</div>

					{/* Content */}
					<FeedbacksContent />
				</div>
			</div>
		</div>
	);
}
