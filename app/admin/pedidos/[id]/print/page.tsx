import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatCurrency } from "@/src/lib/utils";

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
            font-family: monospace;
          }
        }
      `}</style>

			<div className="mb-4 text-center">
				<h1 className="text-lg font-bold">IRON DISTRIBUIDORA</h1>
				<p className="text-xs">Pedido #{order.orderNumber}</p>
				<p className="text-xs">
					{new Date(order.createdAt).toLocaleDateString("pt-BR")} -{" "}
					{new Date(order.createdAt).toLocaleTimeString("pt-BR")}
				</p>
			</div>

			<div className="mb-4 border-b border-black pb-2">
				<p className="font-bold">Cliente:</p>
				<p className="text-sm">{order.customerName}</p>
				<p className="text-sm">{order.customerPhone}</p>
				<p className="mt-2 font-bold">Entrega:</p>
				<p className="text-sm">
					{order.addressLine1}
					{order.addressLine2 ? `, ${order.addressLine2}` : ""}
				</p>
				<p className="text-sm">
					{order.city} - {order.state}
				</p>
				<p className="text-sm">{order.postalCode}</p>
			</div>

			<div className="mb-4 border-b border-black pb-2">
				<p className="mb-2 font-bold">Itens:</p>
				<div className="space-y-2">
					{order.items.map((item) => (
						<div key={item.id} className="text-sm">
							<div className="font-bold">
								{item.quantity}x {item.productName}
							</div>
							<div className="flex justify-between">
								<span className="text-xs">{item.productCode}</span>
								<span>{formatCurrency(item.total)}</span>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mb-4">
				<div className="flex justify-between text-lg font-bold">
					<span>TOTAL</span>
					<span>{formatCurrency(order.total)}</span>
				</div>
			</div>

			{order.notes && (
				<div className="mb-4 border-t border-black pt-2">
					<p className="font-bold">Obs:</p>
					<p className="text-sm">{order.notes}</p>
				</div>
			)}

			<div className="mt-8 text-center text-xs">
				<p>*** FIM DO PEDIDO ***</p>
			</div>

			<script
				dangerouslySetInnerHTML={{
					__html: "window.print();",
				}}
			/>
		</div>
	);
}
