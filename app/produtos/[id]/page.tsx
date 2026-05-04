import { ProductInfo } from "@/src/components/produtos/ProductInfo";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/lib/prisma";
import {
  buildProductJsonLd,
  canViewB2BPrices,
  toPublicProduct,
} from "@/src/lib/product-visibility";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 300; // 5 minutos

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      select: { id: true },
      take: 1000,
    });
    return products.map((p) => ({ id: p.id }));
  } catch {
    // Fallback quando DB não está disponível no build (ex: CI sem DB)
    return [];
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description:
      product.description ||
      `Compre ${product.name} na Iron Distribuidora. Peças originais e com garantia.`,
    openGraph: {
      images: [product.imageUrl, ...previousImages],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const session = await auth();
  const canViewPrices = canViewB2BPrices(session);
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const mappedProduct = toPublicProduct(product, canViewPrices);
  const jsonLd = buildProductJsonLd(product, canViewPrices);

  return (
    <div className="min-h-screen bg-content1">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/"
                className="text-default-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                Início
              </Link>
            </li>
            <li>
              <span className="text-default-300">/</span>
            </li>
            <li>
              <Link
                href="/produtos"
                className="text-default-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                Produtos
              </Link>
            </li>
            <li>
              <span className="text-default-300">/</span>
            </li>
            <li>
              <span className="font-medium text-foreground">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Product Image Column */}
          <div className="lg:col-span-7">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-divider bg-background p-12 shadow-sm">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {product.brand}
                </span>
                <span className="text-sm font-medium text-default-400">
                  Cód: {product.code}
                </span>
              </div>
              <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
            </div>

            <ProductInfo product={mappedProduct} />

            <div className="prose prose-slate max-w-none dark:prose-invert">
              <h3 className="text-lg font-semibold text-foreground">
                Descrição
              </h3>
              <p className="text-default-500">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
