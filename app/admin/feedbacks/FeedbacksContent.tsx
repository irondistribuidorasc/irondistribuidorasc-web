"use client";

import {
	ChartBarIcon,
	ChatBubbleLeftIcon,
	FunnelIcon,
	StarIcon,
} from "@heroicons/react/24/outline";
import {
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Pagination,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StarRating } from "@/src/components/feedback";
import { formatCurrency } from "@/src/lib/utils";
import type { FeedbackStats, FeedbackWithOrder } from "@/types/feedback";

interface FeedbacksResponse {
	feedbacks: FeedbackWithOrder[];
	stats: FeedbackStats;
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

const ratingLabels: Record<number, string> = {
	1: "Péssimo",
	2: "Ruim",
	3: "Regular",
	4: "Bom",
	5: "Excelente",
};

export function FeedbacksContent() {
	const [data, setData] = useState<FeedbacksResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [ratingFilter, setRatingFilter] = useState<string>("all");
	const [commentFilter, setCommentFilter] = useState<string>("all");

	const fetchFeedbacks = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: page.toString(),
				limit: "10",
			});

			if (ratingFilter !== "all") {
				params.append("rating", ratingFilter);
			}

			if (commentFilter !== "all") {
				params.append("hasComment", commentFilter);
			}

			const response = await fetch(`/api/admin/feedbacks?${params}`);

			if (!response.ok) {
				throw new Error("Falha ao carregar avaliações");
			}

			const result = await response.json();
			setData(result);
		} catch (err) {
			console.error("Error fetching feedbacks:", err);
			setError("Não foi possível carregar as avaliações. Tente novamente.");
		} finally {
			setIsLoading(false);
		}
	}, [page, ratingFilter, commentFilter]);

	useEffect(() => {
		fetchFeedbacks();
	}, [fetchFeedbacks]);

	if (isLoading && !data) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Spinner size="lg" color="primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center dark:border-red-700 dark:bg-red-900/20">
				<p className="text-red-600 dark:text-red-400">{error}</p>
				<Button
					onClick={fetchFeedbacks}
					color="danger"
					variant="flat"
					className="mt-4"
				>
					Tentar novamente
				</Button>
			</div>
		);
	}

	if (!data) return null;

	const { feedbacks, stats, pagination } = data;

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{/* Total Feedbacks */}
				<Card className="border border-slate-200 dark:border-slate-800">
					<CardBody className="flex flex-row items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
							<ChatBubbleLeftIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
						</div>
						<div>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Total de Avaliações
							</p>
							<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
								{stats.totalFeedbacks}
							</p>
						</div>
					</CardBody>
				</Card>

				{/* Average Rating */}
				<Card className="border border-slate-200 dark:border-slate-800">
					<CardBody className="flex flex-row items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
							<StarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
						</div>
						<div>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Média Geral
							</p>
							<div className="flex items-center gap-2">
								<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
									{stats.averageRating}
								</p>
								<StarRating
									value={Math.round(stats.averageRating)}
									readOnly
									size="sm"
								/>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* 5 Stars */}
				<Card className="border border-slate-200 dark:border-slate-800">
					<CardBody className="flex flex-row items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
							<ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								5 Estrelas
							</p>
							<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
								{stats.distribution.find((d) => d.rating === 5)?.count || 0}
								<span className="ml-1 text-sm font-normal text-slate-500">
									(
									{stats.distribution
										.find((d) => d.rating === 5)
										?.percentage.toFixed(0) || 0}
									%)
								</span>
							</p>
						</div>
					</CardBody>
				</Card>

				{/* 1-2 Stars */}
				<Card className="border border-slate-200 dark:border-slate-800">
					<CardBody className="flex flex-row items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
							<ChartBarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								1-2 Estrelas
							</p>
							<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
								{(stats.distribution.find((d) => d.rating === 1)?.count || 0) +
									(stats.distribution.find((d) => d.rating === 2)?.count || 0)}
							</p>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Distribution Chart */}
			<Card className="border border-slate-200 dark:border-slate-800">
				<CardBody>
					<h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
						Distribuição de Avaliações
					</h3>
					<div className="space-y-3">
						{[5, 4, 3, 2, 1].map((rating) => {
							const dist = stats.distribution.find((d) => d.rating === rating);
							const percentage = dist?.percentage || 0;
							const count = dist?.count || 0;

							return (
								<div key={rating} className="flex items-center gap-3">
									<div className="flex w-24 items-center gap-1">
										<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
											{rating}
										</span>
										<StarIcon className="h-4 w-4 text-brand-500" />
									</div>
									<div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
										<div
											className="h-full rounded-full bg-brand-500 transition-all duration-500"
											style={{ width: `${percentage}%` }}
										/>
									</div>
									<span className="w-16 text-right text-sm text-slate-500 dark:text-slate-400">
										{count} ({percentage.toFixed(0)}%)
									</span>
								</div>
							);
						})}
					</div>
				</CardBody>
			</Card>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<Dropdown>
					<DropdownTrigger>
						<Button
							variant="flat"
							startContent={<FunnelIcon className="h-4 w-4" />}
						>
							Rating:{" "}
							{ratingFilter === "all" ? "Todos" : `${ratingFilter} estrelas`}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						selectedKeys={[ratingFilter]}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0] as string;
							setRatingFilter(selected);
							setPage(1);
						}}
					>
						<DropdownItem key="all">Todos</DropdownItem>
						<DropdownItem key="5">5 estrelas</DropdownItem>
						<DropdownItem key="4">4 estrelas</DropdownItem>
						<DropdownItem key="3">3 estrelas</DropdownItem>
						<DropdownItem key="2">2 estrelas</DropdownItem>
						<DropdownItem key="1">1 estrela</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown>
					<DropdownTrigger>
						<Button
							variant="flat"
							startContent={<ChatBubbleLeftIcon className="h-4 w-4" />}
						>
							Comentário:{" "}
							{commentFilter === "all"
								? "Todos"
								: commentFilter === "true"
									? "Com"
									: "Sem"}
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						selectedKeys={[commentFilter]}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0] as string;
							setCommentFilter(selected);
							setPage(1);
						}}
					>
						<DropdownItem key="all">Todos</DropdownItem>
						<DropdownItem key="true">Com comentário</DropdownItem>
						<DropdownItem key="false">Sem comentário</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>

			{/* Feedbacks Table */}
			<Card className="border border-slate-200 dark:border-slate-800">
				<CardBody className="p-0">
					<Table
						aria-label="Tabela de avaliações"
						classNames={{
							wrapper: "shadow-none",
						}}
					>
						<TableHeader>
							<TableColumn>PEDIDO</TableColumn>
							<TableColumn>CLIENTE</TableColumn>
							<TableColumn>AVALIAÇÃO</TableColumn>
							<TableColumn>COMENTÁRIO</TableColumn>
							<TableColumn>DATA</TableColumn>
						</TableHeader>
						<TableBody
							emptyContent="Nenhuma avaliação encontrada"
							isLoading={isLoading}
							loadingContent={<Spinner size="sm" />}
						>
							{feedbacks.map((feedback) => (
								<TableRow key={feedback.id}>
									<TableCell>
										<Link
											href={`/admin/pedidos/${feedback.order.id}`}
											className="font-medium text-brand-600 hover:underline dark:text-brand-400"
										>
											#{feedback.order.orderNumber}
										</Link>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{formatCurrency(feedback.order.total)}
										</p>
									</TableCell>
									<TableCell>
										<p className="font-medium text-slate-900 dark:text-slate-100">
											{feedback.order.customerName}
										</p>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<StarRating value={feedback.rating} readOnly size="sm" />
											<Chip
												size="sm"
												variant="flat"
												color={
													feedback.rating >= 4
														? "success"
														: feedback.rating === 3
															? "warning"
															: "danger"
												}
											>
												{ratingLabels[feedback.rating]}
											</Chip>
										</div>
									</TableCell>
									<TableCell>
										{feedback.comment ? (
											<p className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-400">
												{feedback.comment}
											</p>
										) : (
											<span className="text-sm text-slate-400 dark:text-slate-500">
												Sem comentário
											</span>
										)}
									</TableCell>
									<TableCell>
										<p className="text-sm text-slate-600 dark:text-slate-400">
											{format(new Date(feedback.createdAt), "dd/MM/yyyy", {
												locale: ptBR,
											})}
										</p>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="flex justify-center">
					<Pagination
						total={pagination.totalPages}
						page={page}
						onChange={setPage}
						showControls
					/>
				</div>
			)}
		</div>
	);
}
