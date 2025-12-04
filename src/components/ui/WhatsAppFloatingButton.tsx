"use client";

import { getWhatsAppUrl } from "@/src/lib/whatsapp";
import { Button } from "@heroui/react";
import { clsx } from "clsx";

type WhatsAppFloatingButtonProps = {
  className?: string;
  message?: string;
};

const defaultMessage =
  "Olá! Gostaria de falar com a IRON DISTRIBUIDORA SC sobre peças para celular.";

export function WhatsAppFloatingButton({
  className,
  message,
}: WhatsAppFloatingButtonProps) {
  const href = getWhatsAppUrl(message ?? defaultMessage);

  return (
    <Button
      as={"a"}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      isIconOnly
      aria-label="Atendimento via WhatsApp"
      className={clsx(
        "fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-[#25D366] !text-white shadow-lg shadow-[#25D366]/40",
        "hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 256 256"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.4L113.4,108.63,103,124.22a8,8,0,0,0-1.83,7.57,56.14,56.14,0,0,0,31,31A8,8,0,0,0,140,162.73l15.59-10.39,28.23,14.11A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.67-6.54A88,88,0,1,1,128,216Z"></path>
      </svg>
    </Button>
  );
}
