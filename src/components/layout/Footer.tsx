import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8 dark:border-slate-800 dark:bg-slate-900 print:hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-iron.png"
                alt="IRON DISTRIBUIDORA SC"
                width={48}
                height={48}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                IRON DISTRIBUIDORA SC
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Distribuidora de peças para celular com garantia de 1 ano.
              Atendemos Itapema, Tijucas, Porto Belo e São João Batista com
              agilidade e qualidade.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/irondistribuidorasc/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                aria-label="Instagram"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.047-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-3.77 1.795c-.95.043-1.46.25-1.813.388a2.92 2.92 0 00-1.097.713 2.92 2.92 0 00-.713 1.097c-.138.352-.344.862-.388 1.813-.043.95-.05 1.225-.05 3.53v.742c0 2.305.007 2.58.05 3.53.043.951.25 1.461.388 1.814.18.466.43.86.713 1.097.237.284.632.533 1.097.713.353.138.862.344 1.813.388.95.043 1.225.05 3.53.05h.742c2.305 0 2.58-.007 3.53-.05.951-.043 1.461-.25 1.814-.388a2.92 2.92 0 001.097-.713 2.92 2.92 0 00.713-1.097c.138-.353.344-.862.388-1.813.043-.95.05-1.225.05-3.53v-.742c0-2.305-.007-2.58-.05-3.53-.043-.951-.25-1.461-.388-1.814a2.92 2.92 0 00-.713-1.097 2.92 2.92 0 00-1.097-.713c-.353-.138-.862-.344-1.813-.388-.95-.043-1.225-.05-3.53-.05L8.545 3.795zm4.001 3.205a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.916-3.916a1.165 1.165 0 11-2.33 0 1.165 1.165 0 012.33 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Links Rápidos
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/garantia"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Garantia
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Atendimento
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600 dark:text-brand-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Tijucas, SC
                  <br />
                  Atendemos toda a região
                </span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 flex-shrink-0 text-brand-600 dark:text-brand-400" />
                <a
                  href="tel:+5548991147117"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  (48) 99114-7117
                </a>
              </li>
              {/* <li className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 flex-shrink-0 text-brand-600 dark:text-brand-400" />
                <a
                  href="mailto:contato@irondistribuidorasc.com.br"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  contato@irondistribuidorasc.com.br
                </a>
              </li> */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/termos-de-uso"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-trocas"
                  className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  Política de Trocas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            © {currentYear} IRON DISTRIBUIDORA SC. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
