import { SOLANA_APP_NETWORK } from "@/lib/solana-network";

type RpcResponse<T> = {
  result?: T;
  error?: { code?: number; message?: string };
};

async function callDevnetRpc<T>(method: string, params: unknown[], signal: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(SOLANA_APP_NETWORK.rpcEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The Devnet RPC request timed out. Try refreshing again.");
    }
    throw new Error("Could not reach the Solana Devnet RPC. Check your connection and try again.");
  }

  if (!response.ok) {
    if (response.status === 429) throw new Error("The public Devnet RPC is rate-limited. Wait a moment and refresh again.");
    throw new Error(`The Devnet RPC returned HTTP ${response.status}. Try refreshing again shortly.`);
  }

  let payload: RpcResponse<T>;
  try {
    payload = await response.json() as RpcResponse<T>;
  } catch {
    throw new Error("The Devnet RPC returned an unreadable response.");
  }

  if (payload.error) {
    throw new Error(payload.error.message || `The Devnet RPC request failed (${payload.error.code ?? "unknown error"}).`);
  }
  if (payload.result === undefined) throw new Error("The Devnet RPC response did not contain the requested data.");
  return payload.result;
}

export async function verifyDevnetRpc(signal: AbortSignal): Promise<void> {
  const genesisHash = await callDevnetRpc<string>("getGenesisHash", [], signal);
  if (genesisHash !== SOLANA_APP_NETWORK.genesisHash) {
    throw new Error("The RPC endpoint did not identify as Solana Devnet. No balance was displayed.");
  }
}

export async function getDevnetBalance(address: string, signal: AbortSignal): Promise<number> {
  const result = await callDevnetRpc<{ value: number }>("getBalance", [address, { commitment: "confirmed" }], signal);
  if (!Number.isSafeInteger(result.value) || result.value < 0) {
    throw new Error("The Devnet RPC returned a balance that cannot be safely displayed.");
  }
  return result.value;
}
