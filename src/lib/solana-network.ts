/** ProofFlow is configured for Devnet during the wallet connection phase. */
export const SOLANA_APP_NETWORK = {
  label: "Solana Devnet",
  cluster: "devnet",
  rpcEndpoint: "https://api.devnet.solana.com",
  genesisHash: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  lamportsPerSol: 1_000_000_000,
} as const;
