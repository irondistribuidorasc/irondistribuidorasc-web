"use server";

import { auth } from "@/src/lib/auth";
import { db as prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteAllProducts() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.product.deleteMany();
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting all products:", error);
    return { error: "Failed to delete products" };
  }
}
