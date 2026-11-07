# ProofFlow

ProofFlow is an early UI foundation for an AI-assisted milestone payment and escrow product designed for Solana. This repository contains a polished landing page and client, freelancer, and admin dashboard previews. It does **not** connect to a wallet, blockchain, payment provider, or AI service.

## Stack

- Next.js App Router with TypeScript and the `src/` directory
- Tailwind CSS 4 with a small set of global design tokens
- Lucide React icons
- ESLint

## Local setup

Use Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The role dashboards are at `/client/dashboard`, `/freelancer/dashboard`, and `/admin/dashboard`. The original `/dashboard` preview is also retained.

## Project structure

```text
src/
  app/                 App Router pages and global styles
  components/          Shared site UI and role-agnostic dashboard layout
  lib/                 Role-specific demo data and future shared utilities
```

The client, freelancer, and admin overview routes use the same `DashboardLayout` and section components; only their role data and panel content differ. Dashboard content lives in `src/lib/dashboard-data.ts` and is explicitly illustrative. It is not sourced from a wallet or chain and does not represent real balances or activity. Wallets are disconnected, actions are local UI demonstrations, and AI features do not generate responses. Sidebar destinations without an implemented workflow lead to a marked placeholder route. No secrets or environment credentials are needed for the current preview. Local `.env*` files are ignored; use `.env.example` for future non-secret configuration documentation.

## Available commands

```bash
npm run dev
npm run lint
npm run build
```

No Solana program, Anchor/Rust toolchain, wallet connection, transaction execution, or AI integration has been added at this stage.
