# Next.js B2B Template

This is a generic B2B e-commerce template built with Next.js, Prisma, and Tailwind CSS. It is designed to be easily customizable for different businesses.

## Getting Started

### Prerequisites

*   Node.js
*   pnpm (or your preferred package manager)
*   A running PostgreSQL database instance.

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Set up your environment variables by creating a `.env` file and adding the following:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXT_PUBLIC_APP_NAME="Your Company Name"
    NEXT_PUBLIC_APP_URL="https://your-domain.com"
    NEXT_PUBLIC_WHATSAPP_NUMBER="5500000000000"
    ```
4.  Apply database migrations:
    ```bash
    pnpm prisma migrate dev
    ```
5.  Seed the database (creates a default admin user: `admin@example.com` / `admin123`):
    ```bash
    pnpm prisma db seed
    ```

### Running the Development Server

To run the application in development mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

-   **Branding**: Update `NEXT_PUBLIC_APP_NAME` in `.env`.
-   **Colors**: Modify `tailwind.config.ts` to change the color palette.
-   **Products**: Update `src/data/products.ts` or implement a database-driven product management system.
-   **Logo**: Replace `/public/logo-iron.png` with your own logo.

## Building and Running for Production

To build the application for production:

```bash
pnpm build
```

To run the production server:

```bash
pnpm start
```
