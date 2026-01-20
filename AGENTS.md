# Repository Guidelines

## Project Structure & Module Organization
The app router lives in `app/`, with `app/page.tsx` as the primary screen and `app/layout.tsx` providing shared metadata and shell components. Global theming and Tailwind tokens are centralized in `app/globals.css`; prefer colocated component styles only when a pattern cannot be expressed with utilities. Static assets (logos, favicons, mock data) belong in `public/` to benefit from Next.js static routing. Cross-cutting configuration is split across `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`, so update those files together when introducing new tooling. Use the `@/*` path alias from `tsconfig.json` for shared modules to avoid brittle relative imports.

## Build, Test, and Development Commands
Use pnpm to stay in sync with the committed lockfile. `pnpm dev` launches the Next.js dev server at http://localhost:3000 with hot reload. `pnpm build` performs the production build and type checks; run it before raising a pull request. `pnpm start` serves the compiled output for production smoke tests. `pnpm lint` runs the Next.js ESLint preset and should be clean before pushing. `pnpm test` runs unit tests with Vitest. `pnpm test:coverage` runs tests with coverage report (minimum 90% required).

## Coding Style & Naming Conventions
Write components in TypeScript with functional React patterns and strict typing (see `tsconfig.json`). Keep indentation at two spaces and favor concise, declarative JSX. Exported components use `PascalCase`, hooks and utilities use `camelCase`, and incidental files mirror their default export (`app/components/Hero.tsx`). Compose Tailwind classes from layout to modifiers (`flex items-center gap-4 bg-slate-900 text-white`) and reuse design tokens defined in `globals.css`. Commit only formatters or linters that are enforced by the repo; otherwise match the existing style to minimize churn.

## Testing Guidelines
The project uses **Vitest** with **React Testing Library** for unit and integration tests. Tests are located in `src/**/__tests__/` directories. Run `pnpm test` for watch mode or `pnpm test:run` for a single run. Coverage is enforced at 90% minimum for statements, branches, functions, and lines. A **pre-push hook** runs `pnpm test:coverage` automatically to prevent broken code from being pushed. Place colocated specs as `<component>.test.tsx` or group shared suites under `__tests__/`. Keep assertions focused on user-visible behavior.

## Commit & Pull Request Guidelines
The current history only includes the initial scaffold, so establish clear precedent now: use short, imperative commit subjects (`Add hero section layout`) and optional body bullets for context. Separate unrelated changes into distinct commits to simplify reviews. Pull requests should include: a succinct summary, linked issue or task ID, screenshots for UI work, a test plan describing manual or automated checks, and callouts for risky migrations. Mention reviewers when configuration files, build tooling, or shared layouts change so the impact is well understood.

## Environment & Configuration Tips
Secrets and runtime configuration belong in `.env.local`, which is gitignored by default; document any required variables in the pull request. When adding new packages, prefer lightweight, ESM-friendly libraries compatible with Next 16. Keep bundle size in mind—use dynamic imports for rarely used components and audit `pnpm build` warnings before merging.
