"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function NotificationBell({ label }: { label?: string }) {
  const [counts, setCounts] = useState({
    lowStockCount: 0,
    pendingOrdersCount: 0,
    latestOrderId: null as string | null,
  });
  const currentCountsRef = useRef(counts);
  // Removed unused isOpen state
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);

  const isFirstLoad = useRef(true);

  const playSound = useCallback(async (type: "stock" | "order") => {
    // ... (keep existing playSound logic)
    try {
      if (typeof globalThis.window === "undefined") return;

      if (!audioContextRef.current) {
        const AudioContextClass =
          globalThis.AudioContext ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globalThis as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "stock") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          220,
          ctx.currentTime + 0.5
        );
      } else {
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1760,
          ctx.currentTime + 0.1
        );
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(1760, ctx.currentTime);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.2);
        }, 100);
      }

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (error) {
      console.warn("Audio playback failed (likely autoplay policy):", error);
    }
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();

          // Check for new order
          // Notify if:
          // 1. Not first load
          // 2. We have a latest order ID
          // 3. ID is different from last known (new or changed)
          // 4. Total pending count increased or stayed same (implies new order, not just processing old one)
          if (
            !isFirstLoad.current &&
            data.latestOrderId &&
            data.latestOrderId !== lastOrderIdRef.current &&
            data.pendingOrders >= currentCountsRef.current.pendingOrdersCount
          ) {
            playSound("order");
            toast.success("Novo pedido recebido!", {
              action: {
                label: "Ver",
                onClick: () => {
                  globalThis.window.location.href =
                    "/admin/pedidos?status=PENDING";
                },
              },
            });
          }

          // Check for low stock
          // Only alert if NOT first load and count increased
          if (
            !isFirstLoad.current &&
            data.lowStockProducts > currentCountsRef.current.lowStockCount
          ) {
            playSound("stock");
            toast.warning("Atenção: Novos produtos com estoque baixo");
          }

          setCounts({
            lowStockCount: data.lowStockProducts,
            pendingOrdersCount: data.pendingOrders,
            latestOrderId: data.latestOrderId,
          });
          currentCountsRef.current = {
            lowStockCount: data.lowStockProducts,
            pendingOrdersCount: data.pendingOrders,
            latestOrderId: data.latestOrderId,
          };
          lastOrderIdRef.current = data.latestOrderId;
          isFirstLoad.current = false;
        }
      } catch (error) {
        console.error("Failed to check notifications", error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [playSound]); // Added dependency for playSound

  const totalNotifications = counts.lowStockCount + counts.pendingOrdersCount;

  if (totalNotifications === 0) return null;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <div
          className={`cursor-pointer flex items-center ${
            label ? "w-full justify-between" : ""
          }`}
        >
          {label && (
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {label}
            </span>
          )}
          <Badge
            content={totalNotifications}
            color="danger"
            shape="circle"
            isInvisible={totalNotifications === 0}
          >
            <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </Badge>
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="Notificações" variant="flat">
        <DropdownItem
          key="orders"
          description="Pedidos aguardando processamento"
          startContent={<span className="text-xl">📦</span>}
          href="/admin/pedidos?status=PENDING"
        >
          {counts.pendingOrdersCount} Novos Pedidos
        </DropdownItem>
        <DropdownItem
          key="stock"
          description="Produtos com estoque crítico"
          startContent={<span className="text-xl">⚠️</span>}
          className={counts.lowStockCount > 0 ? "text-warning-600" : ""}
          href="/admin/products"
        >
          {counts.lowStockCount} Produtos com Estoque Baixo
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
