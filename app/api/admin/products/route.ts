import { authOptions } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

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
    // Prisma não suporta isso nativamente, então usamos raw query
    if (lowStock) {
      // Constrói a query SQL para filtrar produtos com estoque baixo
      let baseWhere = '"stockQuantity" <= "minStockThreshold"';
      const params: (string | number)[] = [];

      if (search) {
        baseWhere += ` AND (LOWER("name") LIKE $${
          params.length + 1
        } OR LOWER("code") LIKE $${params.length + 1} OR LOWER("model") LIKE $${
          params.length + 1
        })`;
        params.push(`%${search.toLowerCase()}%`);
      }
      if (category) {
        baseWhere += ` AND "category" = $${params.length + 1}`;
        params.push(category);
      }
      if (brand) {
        baseWhere += ` AND "brand" = $${params.length + 1}`;
        params.push(brand);
      }

      const countQuery = `SELECT COUNT(*) as count FROM "Product" WHERE ${baseWhere}`;
      const dataQuery = `SELECT * FROM "Product" WHERE ${baseWhere} ORDER BY "createdAt" DESC LIMIT $${
        params.length + 1
      } OFFSET $${params.length + 2}`;

      const countResult = await db.$queryRawUnsafe<{ count: bigint }[]>(
        countQuery,
        ...params
      );
      total = Number(countResult[0]?.count ?? 0);

      products = await db.$queryRawUnsafe<typeof products>(
        dataQuery,
        ...params,
        limit,
        skip
      );
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
    console.error("Error fetching products:", error);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
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
