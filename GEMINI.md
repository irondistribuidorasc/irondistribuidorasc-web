# Project Overview

This is a full-stack e-commerce web application built with Next.js. It serves as a B2B platform for a distributor, where users can register, get approved by an admin, and then place orders for products.

## Core Technologies

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database ORM**: [Prisma](https://www.prisma.io/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) (inferred from `tailwind.config.ts` and component structure)
*   **Linting**: [ESLint](https://eslint.org/)

## Architecture

The project follows the standard Next.js App Router structure:

*   `app/`: Contains all the application's routes and UI.
    *   `app/api/`: API routes for handling backend logic like authentication, orders, products, etc.
    *   `app/(pages)/`: Different pages of the application, like login, products, orders, etc.
    *   `app/admin/`: Admin-specific pages for managing users, products, and orders.
*   `src/components/`: Reusable React components used throughout the application.
*   `src/lib/`: Core application logic, including Prisma client, authentication configuration, and utility functions.
*   `prisma/`: Contains the database schema (`schema.prisma`) and migrations.

### Data Models

The core data models are defined in `prisma/schema.prisma`:

*   **User**: Represents a user account. Includes fields for user details, store information, role (`USER` or `ADMIN`), and an `approved` status for controlling access.
*   **Product**: Represents a product in the catalog. Includes fields for code, name, brand, category, price, and stock information.
*   **Order**: Represents a customer order. Includes details about the customer, order status, total amount, payment method, and shipping address.
*   **OrderItem**: Represents an item within an order.

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
3.  Set up your environment variables by creating a `.env` file and adding the `DATABASE_URL`.
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
4.  Apply database migrations:
    ```bash
    pnpm prisma migrate dev
    ```

### Running the Development Server

To run the application in development mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building and Running for Production

To build the application for production:

```bash
pnpm build
```

To run the production server:

```bash
pnpm start
```

## Linting

To check for linting errors:

```bash
pnpm lint
```
