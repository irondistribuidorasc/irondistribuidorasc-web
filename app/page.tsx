"use client";

import { WhatsAppFloatingButton } from "@/src/components/ui/WhatsAppFloatingButton";
import { categoryOptions, products } from "@/src/data/products";
import { ProductCard } from "@/src/components/produtos/ProductCard";
import { ScrollAnimation } from "@/src/components/ui/ScrollAnimation";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import {
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
  Battery50Icon,
  BoltIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const featuredProducts = products
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 4);

  return (
    <div className="relative overflow-hidden">
      <section className="relative overflow-hidden bg-white dark:bg-slate-950">
        {/* Background Gradients */}
        <div className="animate-blob absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl filter dark:bg-brand-500/5" />
        <div
          className="animate-blob absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl filter dark:bg-white/5"
          style={{ animationDelay: "2s" }}
        />
        {/* New Center Glow Effect */}
        <div
          className="animate-blob absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[120px] filter"
          style={{ animationDelay: "4s" }}
        />

        {/* Floating 3D Elements */}
        <div className="animate-float absolute left-[10%] top-[20%] -z-10 h-24 w-24 rounded-full bg-gradient-to-br from-brand-400/20 to-transparent blur-xl dark:from-brand-400/10" />
        <div
          className="animate-float absolute right-[15%] top-[15%] -z-10 h-32 w-32 rounded-full bg-gradient-to-bl from-violet-400/20 to-transparent blur-xl dark:from-white/5"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-20 md:flex-row md:items-center md:py-32">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <ScrollAnimation variant="fadeInUp">
              <div className="flex flex-col items-center gap-4 md:items-start">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 opacity-30 blur dark:to-white" />
                  <Image
                    src="/logo-iron.png"
                    alt="IRON DISTRIBUIDORA SC"
                    width={96}
                    height={96}
                    className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl dark:border-slate-900"
                  />
                </div>
                <p className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                  Iron Distribuidora SC
                </p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={0.1}>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                Peças para celular com{" "}
                <span className="animate-shimmer bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 bg-[length:200%_100%] bg-clip-text text-transparent">
                  garantia de 1 ano
                </span>
                .
              </h1>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={0.2}>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 md:mx-0 md:text-xl">
                Peças prontas para envio atacado, atendimento ágil via WhatsApp
                e cobertura nas cidades de Itapema, Tijucas, Porto Belo e São
                João Batista.
              </p>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={0.3}>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                <Button
                  as={Link}
                  href="/produtos"
                  size="lg"
                  className="bg-brand-600 px-8 font-semibold text-white shadow-lg shadow-brand-600/20 transition-transform hover:scale-105 hover:bg-brand-700"
                >
                  Fazer pedido de peças
                </Button>
                <Button
                  as={Link}
                  href="/garantia"
                  size="lg"
                  variant="bordered"
                  className="border-slate-200 font-semibold text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Solicitar garantia / troca
                </Button>
              </div>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={0.4}>
              <div className="flex items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 md:justify-start">
                <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    WhatsApp: (48) 99114-7117
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Atendimento exclusivo para lojistas
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
          <div className="flex-1">
            <ScrollAnimation variant="scaleIn" delay={0.2}>
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500 to-violet-500 opacity-20 blur-xl dark:to-white" />
                <div className="relative rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                  <Image
                    src="/logo-iron.png"
                    alt="IRON DISTRIBUIDORA SC"
                    width={160}
                    height={160}
                    className="mx-auto h-40 w-40 rounded-full object-cover shadow-inner"
                  />
                  <div className="mt-8 space-y-4 text-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Parceiro Oficial do Lojista
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Estoque atualizado, reposição planejada e logística rápida
                      para o seu negócio nunca parar.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50/50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
        {/* Background Blobs */}
        <div className="animate-blob absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-500/5 blur-3xl filter" />
        <div
          className="animate-blob absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl filter dark:bg-white/5"
          style={{ animationDelay: "2s" }}
        />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: TruckIcon,
              title: "Logística Própria",
              desc: "Entregas rápidas em Itapema, Tijucas, Porto Belo e região.",
            },
            {
              icon: ShieldCheckIcon,
              title: "Garantia de 1 Ano",
              desc: "Segurança total para o lojista com nossa política de trocas.",
            },
            {
              icon: CheckBadgeIcon,
              title: "Peças Homologadas",
              desc: "Qualidade original garantida para seus reparos.",
            },
            {
              icon: ChatBubbleLeftRightIcon,
              title: "Suporte Especializado",
              desc: "Atendimento direto e ágil via WhatsApp.",
            },
          ].map((item, index) => (
            <ScrollAnimation
              key={index}
              variant="fadeInUp"
              delay={index * 0.1}
              className="h-full"
            >
              <div className="group flex h-full flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 rounded-2xl bg-brand-50 p-4 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:group-hover:bg-brand-900/30">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </section>

      {/* Brands Section */}
      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-6 text-center">
          <ScrollAnimation variant="fadeIn">
            <p className="mb-10 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Trabalhamos com as principais marcas
            </p>
          </ScrollAnimation>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 md:gap-20">
            {[
              { name: "Samsung", slug: "samsung" },
              { name: "Apple", slug: "apple" },
              { name: "Xiaomi", slug: "xiaomi" },
              { name: "Motorola", slug: "motorola" },
              { name: "LG", slug: "lg" },
            ].map((brand, index) => (
              <ScrollAnimation
                key={brand.name}
                variant="scaleIn"
                delay={index * 0.1}
              >
                <div className="relative h-12 w-32 transition-transform hover:scale-110">
                  <Image
                    src={`/brands/${brand.slug}.svg`}
                    alt={brand.name}
                    fill
                    className="object-contain dark:invert"
                  />
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section (Marquee) */}
      <section className="border-b border-slate-100 bg-white py-12 dark:border-slate-900 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-6">
          <ScrollAnimation variant="fadeIn">
            <p className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Parceiros que confiam na Iron
            </p>
          </ScrollAnimation>
          <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
            <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-12 whitespace-nowrap py-4">
              {[
                "Gold Mustache Barbearia",
                "Tech Cell",
                "Rei do iPhone",
                "Smart Fix",
                "Central dos Reparos",
                "Doctor Phone",
                "Cell Master",
                "Top Assistência",
              ].map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-xl font-bold text-slate-300 transition-colors hover:text-brand-600 dark:text-slate-700 dark:hover:text-brand-500"
                >
                  {/* Placeholder Logo Icon */}
                  <div className="h-8 w-8 rounded-full bg-current opacity-20" />
                  <span>{partner}</span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                "Gold Mustache Barbearia",
                "Tech Cell",
                "Rei do iPhone",
                "Smart Fix",
                "Central dos Reparos",
                "Doctor Phone",
                "Cell Master",
                "Top Assistência",
              ].map((partner, index) => (
                <div
                  key={`dup-${index}`}
                  className="flex items-center gap-3 text-xl font-bold text-slate-300 transition-colors hover:text-brand-600 dark:text-slate-700 dark:hover:text-brand-500"
                >
                  <div className="h-8 w-8 rounded-full bg-current opacity-20" />
                  <span>{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-900/50">
        {/* Background Blobs */}
        <div className="animate-blob absolute left-0 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl filter dark:bg-brand-500/5" />
        <div
          className="animate-blob absolute right-0 bottom-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl filter dark:bg-white/5"
          style={{ animationDelay: "3s" }}
        />
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
            <div className="text-center md:text-left">
              <ScrollAnimation variant="slideInLeft">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  Destaques da Semana
                </h2>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  Os produtos mais procurados por nossos parceiros.
                </p>
              </ScrollAnimation>
            </div>
            <ScrollAnimation variant="slideInRight">
              <Button
                as={Link}
                href="/produtos"
                variant="flat"
                color="danger"
                className="bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
              >
                Ver todo o catálogo
              </Button>
            </ScrollAnimation>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ScrollAnimation
                key={product.id}
                variant="fadeInUp"
                delay={index * 0.1}
              >
                <ProductCard product={product} />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-24 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-4 text-center md:text-left">
            <ScrollAnimation variant="fadeInUp">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Categorias mais pedidas
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Produtos originais e homologados para as principais linhas de
                smartphones.
              </p>
            </ScrollAnimation>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {categoryOptions.map((category, index) => {
              const Icon =
                {
                  display: DevicePhoneMobileIcon,
                  battery: Battery50Icon,
                  charging_board: BoltIcon,
                  back_cover: Square2StackIcon,
                }[category.key] || DevicePhoneMobileIcon;

              return (
                <ScrollAnimation
                  key={category.key}
                  variant="fadeInUp"
                  delay={index * 0.1}
                  className="h-full"
                >
                  <Card className="h-full border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <CardBody className="space-y-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {category.label}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {category.description}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-900/50">
        <div className="animate-float absolute left-10 top-20 h-32 w-32 rounded-full bg-brand-500/5 blur-2xl" />
        <div
          className="animate-float absolute right-10 bottom-20 h-40 w-40 rounded-full bg-violet-500/5 blur-2xl dark:bg-white/5"
          style={{ animationDelay: "2s" }}
        />
        <div className="mx-auto w-full max-w-7xl px-6">
          <ScrollAnimation variant="fadeInUp">
            <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              O que dizem nossos parceiros
            </h2>
          </ScrollAnimation>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "João Silva",
                store: "Cell Fix",
                text: "Desde que comecei a comprar com a Iron, não tive mais problemas com garantia. O atendimento é nota 10.",
              },
              {
                name: "Maria Oliveira",
                store: "Tech Mobile",
                text: "A agilidade na entrega faz toda a diferença para minha loja. Recomendo muito!",
              },
              {
                name: "Carlos Santos",
                store: "Rei do Smartphone",
                text: "Peças de excelente qualidade e preços competitivos. A melhor distribuidora da região.",
              },
            ].map((testimonial, index) => (
              <ScrollAnimation
                key={index}
                variant="fadeInUp"
                delay={index * 0.1}
                className="h-full"
              >
                <Card className="h-full border-none bg-white p-8 shadow-lg dark:bg-slate-900">
                  <CardBody className="gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={testimonial.name}
                        className="h-12 w-12 bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          {testimonial.store}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg italic leading-relaxed text-slate-600 dark:text-slate-300">
                      &quot;{testimonial.text}&quot;
                    </p>
                  </CardBody>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-24 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-4xl px-6">
          <ScrollAnimation variant="fadeInUp">
            <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Perguntas Frequentes
            </h2>
          </ScrollAnimation>
          <ScrollAnimation variant="fadeInUp" delay={0.2}>
            <Accordion
              variant="splitted"
              className="gap-4"
              itemClasses={{
                base: "group bg-slate-50 dark:bg-slate-900 shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 rounded-2xl",
                title: "font-semibold text-slate-900 dark:text-white",
                trigger: "py-6",
                content: "pb-6 text-slate-600 dark:text-slate-400",
                indicator: "text-slate-400 group-hover:text-brand-600",
              }}
            >
              <AccordionItem
                key="1"
                aria-label="Pedido mínimo"
                title="Qual o pedido mínimo para atacado?"
              >
                Trabalhamos com um pedido mínimo de R$ 300,00 para garantir os
                preços de atacado e a viabilidade logística.
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Política de trocas"
                title="Como funciona a política de trocas?"
                subtitle="Garantia de 1 ano em todas as peças"
              >
                Oferecemos garantia de 1 ano contra defeitos de fabricação. A
                troca é realizada de forma ágil, mediante análise técnica
                simples.
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Formas de pagamento"
                title="Quais as formas de pagamento aceitas?"
              >
                Aceitamos PIX, transferência bancária e cartão de crédito. Para
                clientes recorrentes, oferecemos condições especiais de boleto.
              </AccordionItem>
              <AccordionItem
                key="4"
                aria-label="Cidades atendidas"
                title="Entregam em quais cidades?"
              >
                Temos rota própria diária para Itapema, Tijucas, Porto Belo e
                São João Batista. Para outras regiões, enviamos via Correios ou
                transportadora.
              </AccordionItem>
            </Accordion>
          </ScrollAnimation>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="relative overflow-hidden border-t border-slate-100 bg-slate-50 py-24 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="animate-blob absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-6 md:flex-row">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <ScrollAnimation variant="slideInLeft">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                <MapPinIcon className="h-5 w-5" />
                Área de Cobertura
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Atendimento Rápido na Região
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Nossa equipe de logística realiza entregas diárias nas
                principais cidades do litoral, garantindo que você nunca fique
                sem peças.
              </p>
              <ul className="grid grid-cols-2 gap-4 text-left sm:grid-cols-2">
                {[
                  "Itapema",
                  "Tijucas",
                  "Porto Belo",
                  "São João Batista",
                  "Balneário Camboriú",
                  "Bombinhas",
                ].map((city) => (
                  <li
                    key={city}
                    className="flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-300"
                  >
                    <div className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    {city}
                  </li>
                ))}
              </ul>
            </ScrollAnimation>
          </div>
          <div className="flex-1">
            <ScrollAnimation variant="slideInRight">
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-200 shadow-2xl dark:bg-slate-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113865.6674987776!2d-48.69466846536486!3d-27.23867654162383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x952749b7a445555f%3A0x6e25934c6646836e!2sTijucas%2C%20SC!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full"
                  title="Mapa da região de atendimento"
                />
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      <WhatsAppFloatingButton />
    </div>
  );
}
