"use client";

import {
  Notification,
  useNotification,
} from "@/src/contexts/NotificationContext";
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

export default function CustomerNotificationBell({
  label,
}: {
  label?: string;
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotification();
  const router = useRouter();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
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
            color="primary"
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
                  markAllAsRead();
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
