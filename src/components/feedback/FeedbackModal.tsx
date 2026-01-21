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
import { useState } from "react";
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
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleClose = () => {
		if (!isSubmitting) {
			setRating(0);
			setComment("");
			onClose();
		}
	};

	const handleSubmit = async () => {
		if (!order) return;

		if (rating === 0) {
			toast.error("Selecione uma avaliação de 1 a 5 estrelas.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/orders/${order.id}/feedback`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					rating,
					comment: comment.trim() || undefined,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Erro ao enviar avaliação");
			}

			toast.success("Avaliação enviada com sucesso!");
			setRating(0);
			setComment("");
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error submitting feedback:", error);
			toast.error(
				error instanceof Error ? error.message : "Erro ao enviar avaliação",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!order) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="lg"
			classNames={{
				base: "bg-white dark:bg-slate-900",
				header: "border-b border-slate-200 dark:border-slate-800",
				footer: "border-t border-slate-200 dark:border-slate-800",
			}}
		>
			<ModalContent>
				{(onCloseModal) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
								Avalie seu pedido
							</h2>
							<p className="text-sm font-normal text-slate-600 dark:text-slate-400">
								Pedido #{order.orderNumber}
							</p>
						</ModalHeader>

						<ModalBody className="gap-6 py-6">
							<div className="flex flex-col items-center gap-3">
								<p className="text-sm text-slate-600 dark:text-slate-400">
									Como foi sua experiência com este pedido?
								</p>
								<StarRating
									value={rating}
									onChange={setRating}
									size="lg"
									showLabel
								/>
							</div>

							<Textarea
								label="Comentário (opcional)"
								placeholder="Conte-nos mais sobre sua experiência..."
								value={comment}
								onValueChange={setComment}
								maxLength={500}
								description={`${comment.length}/500 caracteres`}
								classNames={{
									input: "resize-none",
									inputWrapper:
										"bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
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
								onPress={handleSubmit}
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
