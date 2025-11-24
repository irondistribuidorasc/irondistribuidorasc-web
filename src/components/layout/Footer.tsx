// import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-slate-600 dark:text-slate-400 md:flex-row md:justify-between">
        <p className="font-medium text-slate-700 dark:text-slate-300">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || "B2B Template"}. Todos os direitos
          reservados.
        </p>
        {/* <Link
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-600 dark:text-brand-400"
        >
          @instagram
        </Link> */}
      </div>
    </footer>
  );
}
