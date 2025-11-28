import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Distribuidora de Peças para Celular em SC | Atacado",
  description:
    "Sua parceira oficial em peças para celular em Santa Catarina. Atendemos Itapema, Tijucas, Porto Belo e região com entrega rápida e garantia de 1 ano.",
  alternates: {
    canonical: "https://irondistribuidorasc.com.br",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
