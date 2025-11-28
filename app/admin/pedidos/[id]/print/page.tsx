import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { formatCurrency } from "@/src/lib/utils";
import { notFound, redirect } from "next/navigation";
import PrintTrigger from "./PrintTrigger";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPrintPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const order = await db.order.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[80mm] bg-white p-2 text-black print:p-0">
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body {
            margin: 0;
            padding: 5px;
            font-family: sans-serif;
            -webkit-print-color-adjust: exact;
          }
        }
        body {
            font-family: sans-serif;
        }
      `}</style>

      <div className="mb-6 text-center">
        <h1 className="text-xl font-black uppercase leading-tight">
          IRON DISTRIBUIDORA
        </h1>
        <p className="text-sm">Pedido #{order.orderNumber}</p>
        <p className="text-sm">
          {new Date(order.createdAt).toLocaleDateString("pt-BR")} -{" "}
          {new Date(order.createdAt).toLocaleTimeString("pt-BR")}
        </p>
      </div>

      <div className="mb-4 border-b-2 border-black pb-4">
        <div className="mb-4">
          <p className="text-base font-bold">Cliente:</p>
          <p className="text-sm leading-tight">{order.customerName}</p>
          <p className="text-sm leading-tight">{order.customerPhone}</p>
        </div>

        <div>
          <p className="text-base font-bold">Entrega:</p>
          <p className="text-sm leading-tight">
            {order.addressLine1}
            {order.addressLine2 ? `, ${order.addressLine2}` : ""}
          </p>
          <p className="text-sm leading-tight">
            {order.city} - {order.state}
          </p>
          <p className="text-sm leading-tight">{order.postalCode}</p>
        </div>
      </div>

      <div className="mb-4 border-b-2 border-black pb-4">
        <p className="mb-3 text-base font-bold">Itens:</p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm">
              <div className="font-bold leading-tight">
                {item.quantity}x {item.productName}
              </div>
              <div className="flex items-start justify-between">
                <span className="text-xs text-gray-600">
                  {item.productCode}
                </span>
                <span className="font-medium">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold uppercase">TOTAL</span>
          <span className="text-xl font-black">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {order.notes && (
        <div className="mb-6 border-t-2 border-black pt-2">
          <p className="font-bold">Obs:</p>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm font-medium">
        <p>*** FIM DO PEDIDO ***</p>
      </div>

      <PrintTrigger />
    </div>
  );
}
