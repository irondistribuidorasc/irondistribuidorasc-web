"use client";

import { FeedbackDisplay } from "@/src/components/feedback";
import { formatCurrency } from "@/src/lib/utils";
import { Order, OrderStatus } from "@/types/order";
import {
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  OTHER: "Outro",
};

function getPaymentMethodLabel(method?: string): string {
  return PAYMENT_METHOD_LABELS[method || ""] || "Não informado";
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const status = statusConfig[order.status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-background",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Pedido #{order.orderNumber}
            </h2>
            <Chip color={status.color} variant="flat" size="sm">
              {status.label}
            </Chip>
          </div>
          <p className="text-sm font-normal text-default-500">
            Realizado em{" "}
            {format(
              new Date(order.createdAt),
              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
              {
                locale: ptBR,
              }
            )}
          </p>
        </ModalHeader>

        <ModalBody className="gap-6 py-6">
          {/* Items do pedido */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <ClipboardDocumentListIcon className="h-5 w-5" />
              Itens do Pedido
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-content1 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.productName}
                    </p>
                    <p className="text-sm text-default-500">
                      Código: {item.productCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {item.quantity}x {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Divider className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">
                Total
              </span>
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {formatCurrency(order.total)}
              </span>
            </div>
            {order.paymentMethod && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-content1 p-4">
                <span className="text-sm font-medium text-default-500">
                  Forma de pagamento
                </span>
                <span className="font-medium text-foreground">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
            )}
          </section>

          <Divider />

          {/* Informações do cliente */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Informações do Cliente
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <IdentificationIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-default-400" />
                <div>
                  <p className="font-medium text-foreground">
                    {order.customerName}
                  </p>
                  {order.customerDocNumber && (
                    <p className="text-sm text-default-500">
                      CPF/CNPJ: {order.customerDocNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-default-400" />
                <p className="text-default-600">
                  {order.customerEmail}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 flex-shrink-0 text-default-400" />
                <p className="text-default-600">
                  {order.customerPhone}
                </p>
              </div>
            </div>
          </section>

          <Divider />

          {/* Endereço de entrega */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <MapPinIcon className="h-5 w-5" />
              Endereço de Entrega
            </h3>
            <div className="rounded-lg bg-content1 p-4">
              <p className="text-foreground">
                {order.addressLine1}
              </p>
              {order.addressLine2 && (
                <p className="text-foreground">
                  {order.addressLine2}
                </p>
              )}
              <p className="text-foreground">
                {order.city}, {order.state} - CEP {order.postalCode}
              </p>
            </div>
          </section>

          {/* Observações */}
          {order.notes && (
            <>
              <Divider />
              <section>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Observações
                </h3>
                <p className="text-default-600">
                  {order.notes}
                </p>
              </section>
            </>
          )}

          {/* Avaliação do pedido */}
          {order.feedback && (
            <>
              <Divider />
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <StarIcon className="h-5 w-5" />
                  Sua Avaliação
                </h3>
                <FeedbackDisplay feedback={order.feedback} />
              </section>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
