"use client";

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Textarea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { logger } from "@/src/lib/logger";
import {
	type OrderFeedbackSchema,
	orderFeedbackSchema,
} from "@/src/lib/schemas";
import { toast } from "sonner";
import type { Order } from "@/types/order";
import { StarRating } from "./StarRating";

interface FeedbackModalProps {
	order: Order | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function FeedbackModal({
	order,
	isOpen,
	onClose,
	onSuccess,
}: FeedbackModalProps) {
	const {
		setValue,
		watch,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<OrderFeedbackSchema>({
		resolver: zodResolver(
			orderFeedbackSchema as ZodType<OrderFeedbackSchema, OrderFeedbackSchema>,
		),
		defaultValues: { rating: 0, comment: "" },
	});

	const rating = watch("rating");
	const comment = watch("comment") ?? "";

	const handleClose = () => {
		if (!isSubmitting) {
			reset();
			onClose();
		}
	};

	const onSubmit = async (data: OrderFeedbackSchema) => {
		if (!order) return;

		try {
			const response = await fetch(`/api/orders/${order.id}/feedback`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					rating: data.rating,
					comment: data.comment?.trim() || undefined,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Erro ao enviar avaliação");
			}

			toast.success("Avaliação enviada com sucesso!");
			reset();
			onSuccess();
			onClose();
		} catch (error) {
			logger.error("Error submitting feedback", { error });
			toast.error(
				error instanceof Error ? error.message : "Erro ao enviar avaliação",
			);
		}
	};

	if (!order) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="lg"
			classNames={{
				base: "bg-background",
				header: "border-b border-divider",
				footer: "border-t border-divider",
			}}
		>
			<ModalContent>
				{(onCloseModal) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							<h2 className="text-xl font-bold text-foreground">
								Avalie seu pedido
							</h2>
							<p className="text-sm font-normal text-default-500">
								Pedido #{order.orderNumber}
							</p>
						</ModalHeader>

						<ModalBody className="gap-6 py-6">
							<div className="flex flex-col items-center gap-4">
								<p className="text-sm text-default-500">
									Como foi sua experiência com este pedido?
								</p>
								<StarRating
									value={rating}
									onChange={(v) => setValue("rating", v)}
									size="lg"
									showLabel
								/>
							</div>

							<Textarea
								label="Comentário (opcional)"
								placeholder="Conte-nos mais sobre sua experiência..."
								value={comment}
								onValueChange={(v) => setValue("comment", v)}
								maxLength={500}
								description={`${comment.length}/500 caracteres`}
								classNames={{
									input: "resize-none",
									inputWrapper:
										"bg-content1 border-divider",
								}}
								onKeyDown={(e) => {
									if (e.key === " ") {
										e.nativeEvent.stopPropagation();
									}
								}}
							/>
						</ModalBody>

						<ModalFooter>
							<Button
								color="default"
								variant="light"
								onPress={onCloseModal}
								isDisabled={isSubmitting}
							>
								Cancelar
							</Button>
							<Button
								color="primary"
								onPress={() => handleSubmit(onSubmit)()}
								isLoading={isSubmitting}
								isDisabled={rating === 0}
							>
								Enviar Avaliação
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
