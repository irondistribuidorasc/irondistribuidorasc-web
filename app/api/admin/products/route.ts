import { authOptions } from "@/src/lib/auth";
import { logger } from "@/src/lib/logger";
import { db } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") || "20"),
    100
  );
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const lowStock = searchParams.get("lowStock") === "true";

  const skip = (page - 1) * limit;

  // Construir filtros do Prisma
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (brand) {
    where.brand = brand;
  }

  try {
    let products: unknown[];
    let total: number;

    // Filtro de estoque baixo requer comparação entre dois campos do mesmo registro
    // Prisma não suporta isso nativamente, então usamos raw query com tagged template
    if (lowStock) {
      const searchPattern = search ? `%${search.toLowerCase()}%` : null;

      // Query segura usando tagged template literals do Prisma
      if (search && category && brand) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          AND "category" = ${category}
          AND "brand" = ${brand}
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          AND "category" = ${category}
          AND "brand" = ${brand}
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else if (search && category) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          AND "category" = ${category}
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          AND "category" = ${category}
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else if (search && brand) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          AND "brand" = ${brand}
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          AND "brand" = ${brand}
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else if (category && brand) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND "category" = ${category}
          AND "brand" = ${brand}
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND "category" = ${category}
          AND "brand" = ${brand}
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else if (search) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND (LOWER("name") LIKE ${searchPattern} OR LOWER("code") LIKE ${searchPattern} OR LOWER("model") LIKE ${searchPattern})
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else if (category) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND "category" = ${category}
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND "category" = ${category}
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else if (brand) {
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND "brand" = ${brand}
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          AND "brand" = ${brand}
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      } else {
        // Sem filtros adicionais
        const countResult = await db.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
        `;
        total = Number(countResult[0]?.count ?? 0);

        products = await db.$queryRaw`
          SELECT * FROM "Product" 
          WHERE "stockQuantity" <= "minStockThreshold"
          ORDER BY "createdAt" DESC 
          LIMIT ${limit} OFFSET ${skip}
        `;
      }
    } else {
      [products, total] = await Promise.all([
        db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.product.count({ where }),
      ]);
    }

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("admin/products:GET - Erro ao buscar produtos", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Basic validation
    if (!body.code || !body.name || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        code: body.code,
        name: body.name,
        brand: body.brand,
        category: body.category,
        model: body.model,
        imageUrl: body.imageUrl || "/logo-iron.png",

        inStock: (body.stockQuantity || 0) > 0,
        stockQuantity: Number.isNaN(Number(body.stockQuantity))
          ? 0
          : Number(body.stockQuantity),
        minStockThreshold: Number.isNaN(Number(body.minStockThreshold))
          ? 10
          : Number(body.minStockThreshold),
        price: Number.isNaN(Number(body.price)) ? 0 : Number(body.price),
        description: body.description,
        tags: body.tags || [],
        popularity: Number.isNaN(Number(body.popularity))
          ? 0
          : Number(body.popularity),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error("admin/products:POST - Erro ao criar produto", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Verificar erro de duplicação (Prisma P2002)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Product with this code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
