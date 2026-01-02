import { db } from "@/src/lib/prisma";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://irondistribuidorasc.com.br";

  // Páginas estáticas do site
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/produtos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/garantia`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Tenta buscar produtos do banco, mas não falha se não conseguir
  // (ex: durante build sem acesso ao DB)
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    productUrls = products.map((product) => ({
      url: `${baseUrl}/produtos/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Durante o build, o banco pode não estar acessível
    // O sitemap será gerado apenas com as páginas estáticas
    console.warn(
      "[sitemap] Não foi possível buscar produtos do banco de dados"
    );
  }

  return [...staticPages, ...productUrls];
}
