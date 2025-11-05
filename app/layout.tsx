import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const title = "IRON DISTRIBUIDORA SC";
const description =
  "Distribuidora de peças para celular com garantia de 1 ano. Atendemos Itapema, Tijucas, Porto Belo e São João Batista.";

export const metadata: Metadata = {
  metadataBase: new URL("https://irondistribuidorasc.com.br"),
  title,
  description,
  keywords: [
    "peças para celular",
    "distribuidora",
    "atacado",
    "IRON DISTRIBUIDORA SC",
    "garantia",
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
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white text-slate-900`}>
        <Providers>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1 bg-white">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
