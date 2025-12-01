"use client";

import { OrderStatus } from "@/types/order";
import { Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PROCESSING", label: "Processando" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusSelector({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    const oldStatus = status;

    // Optimistic update
    setStatus(newStatus as OrderStatus);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar status");
      }

      await response.json();
      toast.success("Status atualizado com sucesso!");

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus as OrderStatus);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Erro ao atualizar status do pedido");

      // Revert optimistic update
      setStatus(oldStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      size="sm"
      label="Status"
      selectedKeys={[status]}
      onChange={(e) => handleStatusChange(e.target.value)}
      isDisabled={isUpdating}
      className="w-40"
      classNames={{
        trigger: "min-h-unit-8 h-8",
      }}
    >
      {statusOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
