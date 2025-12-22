import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import { StagingBanner } from "@/src/components/layout/StagingBanner";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === "true";

const title = isStaging
  ? "[STAGING] IRON DISTRIBUIDORA SC"
  : "IRON DISTRIBUIDORA SC";
const description =
  "Distribuidora de peças para celular com garantia de 1 ano. Atendemos Itapema, Tijucas, Porto Belo e São João Batista.";

export const metadata: Metadata = {
  metadataBase: new URL("https://irondistribuidorasc.com.br"),
  title,
  description,
  robots: isStaging
    ? {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
  verification: {
    google: "SXiK1lviE-scDll1j8nRYL84bYuoFvG10uOdTciatLw", // TODO: Replace with actual code from Google Search Console
  },
  alternates: {
    canonical: "https://irondistribuidorasc.com.br",
  },
  keywords: [
    "peças para celular",
    "distribuidora",
    "atacado",
    "IRON DISTRIBUIDORA SC",
    "garantia",
    "tela iphone atacado",
    "bateria samsung original",
    "peças motorola",
    "peças xiaomi",
    "fornecedor de peças celular sc",
    "itapema",
    "tijucas",
    "porto belo",
  ],
  icons: {
    icon: [
      {
        url: "/favicons/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/favicons/icons/favicon.ico" },
    ],
    apple: [
      {
        url: "/favicons/icons/favicon-57x57.png",
        sizes: "57x57",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-60x60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-76x76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-114x114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/favicons/icons/favicon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title,
    description,
    url: "https://irondistribuidorasc.com.br",
    siteName: "IRON DISTRIBUIDORA SC",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IRON DISTRIBUIDORA SC",
    url: "https://irondistribuidorasc.com.br",
    logo: "https://irondistribuidorasc.com.br/logo-iron.png",
    description:
      "Distribuidora de peças para celular com garantia de 1 ano. Atendemos Itapema, Tijucas, Porto Belo e São João Batista.",
    telephone: "+55-48-99114-7117",
    areaServed: [
      { "@type": "City", name: "Itapema" },
      { "@type": "City", name: "Tijucas" },
      { "@type": "City", name: "Porto Belo" },
      { "@type": "City", name: "São João Batista" },
    ],
    address: {
      "@type": "PostalAddress",
      addressRegion: "SC",
      addressCountry: "BR",
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/irondistribuidorasc", // Placeholder if not known
    ],
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className}`}>
        <Providers>
          <StagingBanner />
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
