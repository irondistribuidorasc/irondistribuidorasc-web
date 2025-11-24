import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { redirect, notFound } from "next/navigation";
import OrderDetailsClient from "./OrderDetailsClient";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function AdminOrderDetailsPage({ params }: PageProps) {
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

	return <OrderDetailsClient order={order} />;
}
