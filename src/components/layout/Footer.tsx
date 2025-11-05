import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-slate-600 md:flex-row md:justify-between">
        <p className="font-medium text-slate-700">
          © {new Date().getFullYear()} IRON DISTRIBUIDORA SC. Todos os direitos
          reservados.
        </p>
        <Link
          href="https://www.instagram.com/irondistribuidorasc/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-600"
        >
          @irondistribuidorasc
        </Link>
      </div>
    </footer>
  );
}
