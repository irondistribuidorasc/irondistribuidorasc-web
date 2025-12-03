"use client";

import { formatCurrency } from "@/src/lib/utils";
import type { Order, OrderStatus } from "@/types/order";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
} from "@heroui/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: "default" | "primary" | "success" | "warning" | "danger";
  }
> = {
  PENDING: { label: "Pendente", color: "warning" },
  CONFIRMED: { label: "Confirmado", color: "primary" },
  PROCESSING: { label: "Processando", color: "primary" },
  SHIPPED: { label: "Enviado", color: "success" },
  DELIVERED: { label: "Entregue", color: "success" },
  CANCELLED: { label: "Cancelado", color: "danger" },
};

export function OrderCard({
  order,
  onViewDetails,
  onCancel,
}: OrderCardProps & { onCancel: (order: Order) => void }) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const status = statusConfig[order.status];
  const isPending = order.status === "PENDING";
  const isCancelled = order.status === "CANCELLED";

  return (
    <Card className="w-full transition-all hover:shadow-lg dark:border dark:border-slate-800">
      <CardHeader className="flex flex-col items-start gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Pedido #{order.orderNumber}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
        <Chip color={status.color} variant="flat" size="sm">
          {status.label}
        </Chip>
      </CardHeader>

      <CardBody className="gap-3 pt-0">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <ShoppingBagIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <span>
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(order.total)}
          </span>
        </div>

        {order.notes && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {order.notes}
          </p>
        )}

        {!isPending && !isCancelled && (
          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <p>
              Para cancelar ou alterar este pedido, entre em contato pelo
              WhatsApp:{" "}
              <a
                href="https://wa.me/5548991147117"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                (48) 99114-7117
              </a>
            </p>
          </div>
        )}
      </CardBody>

      <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          color="primary"
          variant="flat"
          onPress={onViewDetails}
          className="w-full sm:flex-1"
        >
          Ver detalhes
        </Button>
        {isPending && (
          <Button
            color="danger"
            variant="bordered"
            onPress={() => onCancel(order)}
            className="w-full sm:flex-1"
          >
            Cancelar Pedido
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
