"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export default function CustomerNotificationBell({
  label,
}: {
  label?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, []);

  useEffect(() => {
    // Wrap in a timeout to avoid synchronous state update warning during render phase
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: "PATCH",
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    const unreadNotifications = notifications.filter((n) => !n.read);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" })
        )
      );
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      fetchNotifications(); // Revert on error
    }
  };

  if (notifications.length === 0) return null;

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
            content={unreadCount}
            color="danger"
            shape="circle"
            isInvisible={unreadCount === 0}
          >
            <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </Badge>
        </div>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Notificações"
        variant="flat"
        className="w-80 max-h-96 overflow-y-auto"
        itemClasses={{
          base: "gap-4",
        }}
      >
        <DropdownItem
          key="header"
          className="h-10 opacity-100 cursor-default"
          isReadOnly
          textValue="Notificações"
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-lg">Notificações</span>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="light"
                color="primary"
                className="h-6 px-2 text-xs"
                onPress={() => {
                  handleMarkAllAsRead();
                }}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </DropdownItem>

        {notifications.length === 0 ? (
          <DropdownItem key="empty" isReadOnly textValue="Sem notificações">
            <div className="text-center text-slate-500 py-4">
              Nenhuma notificação
            </div>
          </DropdownItem>
        ) : (
          (notifications.map((notification) => (
            <DropdownItem
              key={notification.id}
              textValue={notification.title}
              className={
                !notification.read ? "bg-brand-50 dark:bg-brand-900/20" : ""
              }
              onPress={() => handleNotificationClick(notification)}
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">
                  {notification.title}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {notification.message}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(notification.createdAt).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            </DropdownItem>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          )) as any)
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
