import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/minha-conta/", "/meus-pedidos/"],
    },
    sitemap: "https://irondistribuidorasc.com.br/sitemap.xml",
  };
}
