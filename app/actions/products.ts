"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db as prisma } from "@/src/lib/prisma";

export async function deleteAllProducts() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" };
  }

  try {
    await prisma.product.deleteMany();
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    logger.error("actions/products - Erro ao excluir todos os produtos", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Erro ao excluir produtos" };
  }
}
