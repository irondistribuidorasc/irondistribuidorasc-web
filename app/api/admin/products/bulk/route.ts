import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates must be an array" },
        { status: 400 }
      );
    }

    // Process updates in a transaction if possible, or parallel promises
    // Prisma doesn't support bulk update with different values in one query easily yet.
    // We will use Promise.all to execute them in parallel, but we should be careful about connection limits.
    // For a reasonable number of updates (e.g. < 50), Promise.all is fine.

    const results = await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updates.map(async (update: any) => {
        if (!update.id) throw new Error("Missing product ID");

        // Filter out undefined/null values to avoid overwriting with null if not intended
        // But here we expect the frontend to send only changed fields or full object.
        // Let's assume we receive fields to update.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataToUpdate: any = {};
        if (update.stockQuantity !== undefined)
          dataToUpdate.stockQuantity = update.stockQuantity;
        if (update.minStockThreshold !== undefined)
          dataToUpdate.minStockThreshold = update.minStockThreshold;

        // Add other fields if needed, but StockManager mainly updates these two.
        // If we want to support generic bulk update, we can allow more fields.

        if (Object.keys(dataToUpdate).length === 0) return null;

        // Update inStock based on new stockQuantity if present
        if (dataToUpdate.stockQuantity !== undefined) {
          dataToUpdate.inStock = dataToUpdate.stockQuantity > 0;
        }

        return db.product.update({
          where: { id: update.id },
          data: dataToUpdate,
        });
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      console.error("Bulk update errors:", errors);
    }

    return NextResponse.json({
      message: `Updated ${successCount} products`,
      successCount,
      errorCount: errors.length,
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    );
  }
}
