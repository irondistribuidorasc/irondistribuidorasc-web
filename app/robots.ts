import { MetadataRoute } from "next";

const isStaging = process.env.VERCEL_ENV === "preview";

export default function robots(): MetadataRoute.Robots {
  // Em staging, bloqueia todos os crawlers
  if (isStaging) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/minha-conta/", "/meus-pedidos/"],
    },
    sitemap: "https://irondistribuidorasc.com.br/sitemap.xml",
  };
}
