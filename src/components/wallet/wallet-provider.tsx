"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDevnetBalance, verifyDevnetRpc } from "@/lib/solana-rpc";

type PhantomPublicKey = { toString: () => string };
type PhantomEvent = "connect" | "disconnect" | "accountChanged";

type PhantomSolanaProvider = {
  isPhantom: boolean;
  isConnected: boolean;
  publicKey: PhantomPublicKey | null;
  connect: () => Promise<{ publicKey: PhantomPublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, listener: (publicKey?: PhantomPublicKey | null) => void) => void;
  removeListener?: (event: PhantomEvent, listener: (publicKey?: PhantomPublicKey | null) => void) => void;
};

declare global {
  interface Window {
    phantom?: { solana?: PhantomSolanaProvider };
  }
}

export type WalletStatus = "checking" | "disconnected" | "connecting" | "connected";
export type BalanceStatus = "idle" | "loading" | "loaded" | "error";
export type DevnetRpcStatus = "idle" | "checking" | "verified" | "error";

type WalletContextValue = {
  isPhantomAvailable: boolean;
  publicKey: string | null;
  status: WalletStatus;
  error: string | null;
  balanceLamports: number | null;
  balanceStatus: BalanceStatus;
  balanceError: string | null;
  devnetRpcStatus: DevnetRpcStatus;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function getPhantomProvider(): PhantomSolanaProvider | null {
  if (typeof window === "undefined") return null;
  const provider = window.phantom?.solana;
  return provider?.isPhantom ? provider : null;
}

function connectionError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? (error as { code?: unknown }).code
    : undefined;

  if (code === 4001) return "The connection request was declined in Phantom. No wallet was connected.";
  if (code === 4100) return "Phantom has not authorized this site. Try again and approve the connection request.";
  if (code === 4900) return "Phantom could not connect to its network. Check Phantom and try again.";
  return "Phantom could not connect. Unlock your wallet and try again.";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<PhantomSolanaProvider | null>(null);
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>("idle");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [devnetRpcStatus, setDevnetRpcStatus] = useState<DevnetRpcStatus>("idle");
  const requestSequence = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const phantom = getPhantomProvider();
    setProvider(phantom);
    setIsPhantomAvailable(Boolean(phantom));

    if (!phantom) {
      setStatus("disconnected");
      return;
    }

    if (phantom.isConnected && phantom.publicKey) {
      setPublicKey(phantom.publicKey.toString());
      setStatus("connected");
    } else {
      setStatus("disconnected");
    }

    const handleConnect = (key?: PhantomPublicKey | null) => {
      const connectedKey = key ?? phantom.publicKey;
      if (!connectedKey) return;
      setPublicKey(connectedKey.toString());
      setStatus("connected");
      setError(null);
    };
    const handleDisconnect = () => {
      setPublicKey(null);
      setStatus("disconnected");
    };
    const handleAccountChanged = (key?: PhantomPublicKey | null) => {
      if (!key) {
        setPublicKey(null);
        setStatus("disconnected");
        return;
      }
      setPublicKey(key.toString());
      setStatus("connected");
      setError(null);
    };

    phantom.on("connect", handleConnect);
    phantom.on("disconnect", handleDisconnect);
    phantom.on("accountChanged", handleAccountChanged);

    return () => {
      phantom.removeListener?.("connect", handleConnect);
      phantom.removeListener?.("disconnect", handleDisconnect);
      phantom.removeListener?.("accountChanged", handleAccountChanged);
    };
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setBalanceLamports(null);
      setBalanceStatus("idle");
      setBalanceError(null);
      setDevnetRpcStatus("idle");
      return;
    }

    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const requestId = ++requestSequence.current;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    setBalanceStatus("loading");
    setBalanceError(null);
    setDevnetRpcStatus("checking");

    let endpointVerified = false;
    try {
      await verifyDevnetRpc(controller.signal);
      if (requestId !== requestSequence.current) return;
      endpointVerified = true;
      setDevnetRpcStatus("verified");
      const lamports = await getDevnetBalance(publicKey, controller.signal);
      if (requestId !== requestSequence.current) return;
      setBalanceLamports(lamports);
      setBalanceStatus("loaded");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      const message = cause instanceof Error ? cause.message : "Unable to read the Devnet balance. Try refreshing again.";
      setBalanceError(message);
      setBalanceStatus("error");
      if (!endpointVerified) setDevnetRpcStatus("error");
    } finally {
      window.clearTimeout(timeout);
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, [publicKey]);

  useEffect(() => {
    if (status === "connected" && publicKey) {
      void refreshBalance();
      return;
    }

    requestSequence.current += 1;
    activeRequest.current?.abort();
    activeRequest.current = null;
    setBalanceLamports(null);
    setBalanceStatus("idle");
    setBalanceError(null);
    setDevnetRpcStatus("idle");
  }, [status, publicKey, refreshBalance]);

  const connect = useCallback(async () => {
    const wallet = provider ?? getPhantomProvider();
    if (!wallet) {
      setIsPhantomAvailable(false);
      setError("Phantom was not detected in this browser. Install or unlock Phantom, then try again.");
      return false;
    }

    setProvider(wallet);
    setIsPhantomAvailable(true);
    setError(null);
    setStatus("connecting");

    try {
      const response = await wallet.connect();
      setPublicKey(response.publicKey.toString());
      setStatus("connected");
      return true;
    } catch (cause) {
      setStatus("disconnected");
      setError(connectionError(cause));
      return false;
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    const wallet = provider ?? getPhantomProvider();
    if (!wallet) {
      setPublicKey(null);
      setStatus("disconnected");
      return true;
    }

    try {
      await wallet.disconnect();
      setPublicKey(null);
      setStatus("disconnected");
      setError(null);
      return true;
    } catch (cause) {
      setError(connectionError(cause));
      return false;
    }
  }, [provider]);

  const clearError = useCallback(() => setError(null), []);
  const value = useMemo(() => ({ isPhantomAvailable, publicKey, status, error, balanceLamports, balanceStatus, balanceError, devnetRpcStatus, connect, disconnect, refreshBalance, clearError }), [isPhantomAvailable, publicKey, status, error, balanceLamports, balanceStatus, balanceError, devnetRpcStatus, connect, disconnect, refreshBalance, clearError]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}
