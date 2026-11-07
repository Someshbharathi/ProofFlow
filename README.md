# ProofFlow

ProofFlow is an early UI foundation for an AI-assisted milestone payment and escrow product designed for Solana. This repository contains the approved Metro-inspired landing page and client, freelancer, and admin dashboard previews. Supabase Auth provides email/password and Google OAuth sign-in with cookie-backed sessions; dashboard access is enforced by server-side profile roles. Dashboard topbars connect to the Phantom browser provider for a public address and read the account's SOL balance through ProofFlow's Devnet RPC endpoint. No messages are signed, transactions submitted, or AI service calls made.

## Stack

- Next.js App Router with TypeScript and the `src/` directory
- Tailwind CSS 4 with a small set of global design tokens
- Lucide React icons
- Phantom injected Solana provider (public-key connection; no wallet SDK dependencies)
- Read-only Solana JSON-RPC calls to Devnet (`getGenesisHash`, `getBalance`)
- Supabase Auth via `@supabase/supabase-js` and `@supabase/ssr`
- ESLint

## Local setup

Use Node.js 20.9 or newer and npm.

```bash
npm install
```

To enable authentication, add the Supabase project URL and publishable key to `.env.local` in the project root. The legacy anon key variable is also supported. These are public client configuration values; never put a Supabase secret or service-role key in this app. Without them, the login and signup pages remain available but disable auth actions. Configure Supabase Auth and install the profile migration as described below.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The role dashboards are at `/client/dashboard`, `/freelancer/dashboard`, and `/admin/dashboard`. The original `/dashboard` preview is also retained.

## Project structure

```text
src/
  app/                 App Router pages and global styles
  components/          Shared site UI and role-agnostic dashboard layout
  lib/                 Role-specific demo data, auth and Supabase utilities
supabase/migrations/   Profile table, role constraints, trigger and RLS
```

The client, freelancer, and admin overview routes use the same `DashboardLayout` and section components; only their role data and panel content differ. Dashboard content lives in `src/lib/dashboard-data.ts` and is explicitly illustrative. It is not sourced from a wallet or chain and does not represent real balances or activity. Phantom can share its public address when the user approves a connection; dashboard actions remain local UI demonstrations, and AI features do not generate responses. Sidebar destinations without an implemented workflow lead to a marked placeholder route. Local `.env*` files are ignored by Git.

## Supabase setup

1. Create a Supabase project and edit `.env.local` in the project root.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project's API settings. Existing projects may instead set `NEXT_PUBLIC_SUPABASE_ANON_KEY`; ProofFlow accepts either name and prefers the publishable variable if both are set. These public keys are safe for browser use when RLS is enabled.
3. In Supabase Authentication settings, enable Email and choose whether new accounts require email confirmation.
4. Add `http://localhost:3000/auth/callback` and your production callback URL to the Supabase Auth redirect URL allow list. Set the Site URL to the matching app origin.
5. For Google, create a Web OAuth client in Google Cloud. Add your app origin to Authorized JavaScript origins and the Supabase Auth callback URL shown in the Google provider settings to Authorized redirect URIs. Enter the Google client ID and secret in Supabase Auth → Providers → Google and enable the provider. Do not add Google secrets to this repository.
6. In the Supabase SQL editor, run [`supabase/migrations/202611070001_profiles_auth.sql`](supabase/migrations/202611070001_profiles_auth.sql). It creates `profiles`, a signup trigger, role immutability through grants/RLS, and the one-time OAuth role completion function.
7. Restart the Next.js server after changing `.env.local` (and rebuild production output after changing public env values), then use `/signup` and `/login`.

Public signup supports Client and Freelancer only. The profile trigger ignores any other requested role; Admin promotion is an operator-only action in Supabase SQL after verifying the user's auth ID, for example: `update public.profiles set role = 'admin', role_confirmed = true where id = '<verified-auth-user-uuid>';`. Never expose that operation through a public client endpoint. Authenticated users can read only their own profile and update only their own full name/avatar fields. Dashboard role layouts verify the Supabase user and profile on the server; middleware refreshes SSR cookies. OAuth callback role values are allow-listed to Client/Freelancer, and existing confirmed roles are preserved.

Google OAuth and live account/session tests require the external Supabase and Google provider setup above. This repository does not contain credentials and does not claim those provider settings are configured.

Wallet and read-only balance state are shared from `src/components/wallet/wallet-provider.tsx`. Phantom must be installed in the browser (or use Phantom's in-app browser on mobile). Only the public key is read from Phantom. ProofFlow calls the fixed `https://api.devnet.solana.com` endpoint and checks its genesis hash before requesting that address's SOL balance. Phantom's documented injected provider does not expose its selected Solana cluster, so the app cannot verify that setting; the UI warns users to confirm Devnet in Phantom. A Devnet RPC balance is not proof of Phantom's selected cluster. No private key, recovery phrase, signature, or transaction is requested. Devnet SOL is test-only and has no real monetary value.

### Test Phantom and read-only Devnet balance

1. Install or unlock Phantom from [phantom.com](https://phantom.com/). On mobile, open the local app through Phantom's in-app browser.
2. In Phantom, select/enable Solana Devnet for development. ProofFlow cannot read Phantom's selected cluster; its warning remains visible by design.
3. Start ProofFlow with `npm run dev` and open `http://localhost:3000/client/dashboard`, `/freelancer/dashboard`, or `/admin/dashboard`.
4. Select **Connect wallet** in the dashboard topbar, then approve the public-key connection request in Phantom.
5. Confirm the shortened address appears in the topbar. Open its wallet dialog to view the Devnet SOL balance, Devnet RPC verification state, and **Refresh** action. The network menu also reports the ProofFlow RPC state.
6. Switch Phantom accounts to check the address and balance refresh, or disconnect from the wallet dialog (or Phantom). To check rejection handling, disconnect and reject the next Phantom connection prompt.

If the address has no Devnet SOL, the balance may correctly read `0 SOL`. To see a nonzero test balance, use Solana's Devnet faucet outside ProofFlow. Demo SOL figures elsewhere on the dashboards remain mock data and are not wallet balances. The public Devnet RPC is rate-limited and intended for development only.

## Available commands

```bash
npm run dev
npm run lint
npm run build
```

No Solana program, Anchor/Rust toolchain, token balance reads, message signing, transaction execution, escrow operation, or AI integration has been added at this stage. The only chain read is the native SOL account balance from Devnet.
