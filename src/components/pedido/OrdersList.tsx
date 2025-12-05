"use client";

import type { Order } from "@/types/order";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrderCard } from "./OrderCard";
import { OrderDetailsModal } from "./OrderDetailsModal";

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    onOpen();
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/orders/${orderToCancel.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao cancelar pedido");
      }

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      toast.success("Pedido cancelado com sucesso!");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Erro ao cancelar pedido. Tente novamente.");
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };

  const handleModalClose = () => {
    if (!isCancelling) {
      setOrderToCancel(null);
      onClose();
    }
  };

  return (
    <>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={() => setSelectedOrder(order)}
            onCancel={handleCancelClick}
          />
        ))}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Modal de confirmação de cancelamento */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleModalClose}
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cancelar Pedido
              </ModalHeader>
              <ModalBody>
                <p className="text-slate-600 dark:text-slate-400">
                  Tem certeza que deseja cancelar o pedido{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    #{orderToCancel?.orderNumber}
                  </span>
                  ?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Esta ação não pode ser desfeita.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={onCloseModal}
                  isDisabled={isCancelling}
                >
                  Voltar
                </Button>
                <Button
                  color="danger"
                  onPress={handleConfirmCancel}
                  isLoading={isCancelling}
                >
                  Cancelar Pedido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
