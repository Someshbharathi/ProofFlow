"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, ExternalLink, LoaderCircle, LogOut, RefreshCw, Wallet, X, Zap } from "lucide-react";
import { useWallet } from "@/components/wallet/wallet-provider";
import { SOLANA_APP_NETWORK } from "@/lib/solana-network";

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectionControl() {
  const { isPhantomAvailable, publicKey, status, error, balanceLamports, balanceStatus, balanceError, devnetRpcStatus, connect, disconnect, refreshBalance, clearError } = useWallet();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (dialogOpen) {
      wasOpen.current = true;
      dialogRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && status !== "connecting") {
          setDialogOpen(false);
          return;
        }
        if (event.key === "Tab") {
          const targets = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
          if (!targets?.length) return;
          const first = targets[0];
          const last = targets[targets.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
            event.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [dialogOpen, status]);

  const openDialog = () => {
    clearError();
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (status === "connecting") return;
    setDialogOpen(false);
  };

  return <>
    <button
      ref={triggerRef}
      type="button"
      onClick={openDialog}
      aria-label={publicKey ? `Connected wallet ${publicKey}. Manage wallet connection` : "Connect Phantom wallet"}
      className="inline-flex h-7 max-w-[156px] items-center gap-1.5 rounded-lg border border-white/[.08] bg-white/[.025] px-2 text-[9px] font-medium text-slate-200 transition hover:border-violet-300/25 hover:bg-violet-300/[.06] sm:px-2.5"
    >
      <Wallet aria-hidden="true" size={12} className="shrink-0 text-violet-200" />
      <span className="truncate">{status === "checking" ? "Checking wallet" : publicKey ? shortenAddress(publicKey) : "Connect wallet"}</span>
      {publicKey && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-emerald-400" />}
    </button>

    {dialogOpen && mounted && createPortal(<div className="fixed inset-0 z-[1000] isolate grid place-items-center bg-[#05050a]/90 p-4" onMouseDown={event => { if (event.target === event.currentTarget) closeDialog(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title" aria-describedby="wallet-dialog-description" tabIndex={-1} className="relative z-[1001] max-h-[calc(100dvh-2rem)] w-full max-w-[420px] overflow-y-auto rounded-2xl border border-violet-300/20 bg-[#10101a] p-5 shadow-[0_24px_90px_rgba(0,0,0,.8)] outline-none sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-violet-300/15 bg-violet-300/[.1] text-violet-200"><Zap aria-hidden="true" size={19} fill="currentColor" /></span>
            <div><p className="text-[10px] font-medium uppercase tracking-[.16em] text-violet-300">ProofFlow wallet</p><h2 id="wallet-dialog-title" className="mt-1 text-lg font-semibold tracking-tight text-white">{publicKey ? "Wallet connected" : "Connect Phantom"}</h2></div>
          </div>
          <button type="button" onClick={closeDialog} disabled={status === "connecting"} aria-label="Close wallet dialog" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[.06] hover:text-white disabled:opacity-40"><X aria-hidden="true" size={16} /></button>
        </div>

        <p id="wallet-dialog-description" className="mt-4 text-xs leading-5 text-slate-400">
          {publicKey ? "Your public address is connected. The balance below is queried from ProofFlow’s cluster-verified Solana Devnet RPC; no transaction or signature is requested." : "Connect your Phantom wallet to share its public address with ProofFlow. You will approve the request in Phantom."}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[.07] bg-black/20 px-3.5 py-3">
          <div><p className="text-[9px] uppercase tracking-wide text-slate-500">ProofFlow network</p><p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-100"><span className={`size-1.5 rounded-full ${devnetRpcStatus === "verified" ? "bg-emerald-400" : devnetRpcStatus === "error" ? "bg-rose-400" : "bg-amber-300"}`} /> {SOLANA_APP_NETWORK.label}</p></div>
          <span className="rounded-md border border-violet-300/10 bg-violet-300/[.06] px-2 py-1 text-[8px] font-medium uppercase tracking-wide text-violet-200">Devnet only</span>
        </div>

        <p role="note" className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/15 bg-amber-300/[.05] p-3 text-[10px] leading-4 text-amber-100"><AlertCircle aria-hidden="true" size={13} className="mt-0.5 shrink-0" />Phantom does not expose its selected Solana cluster here, so ProofFlow cannot verify that the wallet is set to Devnet. Confirm Devnet in Phantom. ProofFlow independently verifies its Devnet RPC before showing a balance.</p>

        {publicKey && <div className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-300/[.04] p-3"><p className="flex items-center gap-2 text-[10px] font-medium text-emerald-200"><CheckCircle2 aria-hidden="true" size={14} /> Connected public address</p><p className="mt-2 break-all font-mono text-[10px] leading-5 text-slate-300">{publicKey}</p></div>}

        <div className="mt-3 rounded-xl border border-white/[.07] bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-[9px] uppercase tracking-wide text-slate-500">Devnet SOL balance</p><p aria-live="polite" className="mt-1 text-sm font-semibold text-white">{balanceStatus === "loading" ? "Reading Devnet balance…" : balanceStatus === "loaded" && balanceLamports !== null ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(balanceLamports / SOLANA_APP_NETWORK.lamportsPerSol)} SOL` : balanceStatus === "error" ? "Balance unavailable" : publicKey ? "Balance not loaded" : "Connect wallet to read balance"}</p></div>
            <button type="button" onClick={() => void refreshBalance()} disabled={!publicKey || balanceStatus === "loading"} aria-label="Refresh Devnet SOL balance" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/[.08] px-2.5 text-[9px] font-medium text-slate-300 transition hover:border-violet-300/25 hover:bg-violet-300/[.06] disabled:cursor-not-allowed disabled:opacity-40">{balanceStatus === "loading" ? <LoaderCircle aria-hidden="true" size={12} className="animate-spin" /> : <RefreshCw aria-hidden="true" size={12} />} Refresh</button>
          </div>
          <p className="mt-2 text-[9px] leading-4 text-slate-500">Read-only account data from Solana Devnet. Devnet SOL is for testing and has no real monetary value.</p>
          {devnetRpcStatus === "verified" && <p className="mt-2 text-[9px] text-emerald-200">ProofFlow RPC cluster verified as Devnet.</p>}
          {balanceError && <p role="alert" className="mt-2 flex items-start gap-1.5 text-[9px] leading-4 text-rose-200"><AlertCircle aria-hidden="true" size={12} className="mt-0.5 shrink-0" />{balanceError}</p>}
        </div>

        {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-rose-300/15 bg-rose-300/[.06] p-3 text-[10px] leading-4 text-rose-200"><AlertCircle aria-hidden="true" size={14} className="mt-0.5 shrink-0" />{error}</p>}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {publicKey ? <button type="button" onClick={async () => { const done = await disconnect(); if (done) setDialogOpen(false); }} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[.09] bg-white/[.035] px-4 text-xs font-medium text-slate-200 transition hover:border-rose-300/20 hover:bg-rose-300/[.06] hover:text-rose-100"><LogOut aria-hidden="true" size={14} /> Disconnect wallet</button> : isPhantomAvailable ? <button type="button" onClick={() => void connect()} disabled={status === "connecting"} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-4 text-xs font-semibold text-white shadow-[0_6px_22px_rgba(124,58,237,.24)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-65">{status === "connecting" ? <><LoaderCircle aria-hidden="true" size={14} className="animate-spin" /> Waiting for Phantom…</> : <><Wallet aria-hidden="true" size={14} /> Connect Phantom</>}</button> : <a href="https://phantom.com/" target="_blank" rel="noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-4 text-xs font-semibold text-white shadow-[0_6px_22px_rgba(124,58,237,.24)] transition hover:brightness-110">Get Phantom <ExternalLink aria-hidden="true" size={13} /></a>}
          <button type="button" onClick={closeDialog} disabled={status === "connecting"} className="h-10 rounded-xl px-4 text-xs text-slate-400 transition hover:bg-white/[.04] hover:text-white disabled:opacity-40">{publicKey ? "Done" : "Cancel"}</button>
        </div>

        <p className="mt-4 border-t border-white/[.06] pt-3 text-center text-[9px] text-slate-600">ProofFlow never asks for your recovery phrase or private keys.</p>
      </div>
    </div>, document.body)}
  </>;
}
