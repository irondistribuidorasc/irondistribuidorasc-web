"use client";

import { Button } from "@heroui/react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";

type WhatsAppFloatingButtonProps = {
  className?: string;
  message?: string;
};

const defaultMessage =
  "Olá! Gostaria de falar com a IRON DISTRIBUIDORA SC sobre peças para celular.";

export function WhatsAppFloatingButton({ className, message }: WhatsAppFloatingButtonProps) {
  const phone = "5548991147117";
  const encodedMessage = encodeURIComponent(message ?? defaultMessage);
  const href = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <Button
      as={"a"}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      startContent={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
      color="danger"
      className={clsx(
        "fixed bottom-5 right-5 z-40 h-12 rounded-full bg-brand-600 px-6 text-white shadow-lg shadow-brand-600/40",
        "hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      Atendimento via WhatsApp
    </Button>
  );
}

