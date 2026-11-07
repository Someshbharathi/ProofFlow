"use client";

import { useState } from "react";
import { Bell, Check, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NotificationItem = { id: string; title: string; body: string; kind: string; created_at: string; read_at: string | null };

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");
  const [reading, setReading] = useState<string | null>(null);

  async function toggle() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (loading) return;
    setLoading(true); setError("");
    try {
      const { data, error: queryError } = await createClient().from("notifications")
        .select("id,title,body,kind,created_at,read_at").order("created_at", { ascending: false }).limit(10);
      if (queryError) throw queryError;
      setItems((data ?? []) as NotificationItem[]);
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `${failure.code}: ` : ""}${failure.message ?? "Notifications could not be loaded."}`);
    } finally { setLoading(false); }
  }

  async function markRead(id: string) {
    setReading(id); setError("");
    try {
      const { error: rpcError } = await createClient().rpc("mark_notification_read", { p_notification_id: id });
      if (rpcError) throw rpcError;
      setItems(current => current.map(item => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(`${failure.code ? `${failure.code}: ` : ""}${failure.message ?? "Notification could not be updated."}`);
    } finally { setReading(null); }
  }

  const unread = items.filter(item => !item.read_at).length;
  return <div className="relative">
    <button type="button" onClick={() => void toggle()} aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} aria-expanded={open} className="relative grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[.06] hover:text-white"><Bell aria-hidden="true" size={14} />{unread > 0 && <span aria-hidden="true" className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-violet-300" />}</button>
    {open && <section aria-label="Notifications" className="absolute right-0 top-11 z-50 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-xl border border-white/10 bg-[#151827] shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/[.07] px-3 py-2.5"><h2 className="text-[10px] font-semibold text-slate-100">Notifications</h2><span className="text-[8px] text-slate-500">In-app only</span></header>
      {loading ? <div role="status" className="flex items-center justify-center gap-2 p-5 text-[9px] text-slate-400"><LoaderCircle size={13} className="animate-spin" />Loading notifications…</div> : error ? <p role="alert" className="p-4 text-[9px] leading-4 text-amber-100">{error}</p> : !items.length ? <p className="p-4 text-[9px] text-slate-500">No notifications yet.</p> : <ul className="max-h-80 divide-y divide-white/[.055] overflow-y-auto">{items.map(item => <li key={item.id} className={`p-3 ${item.read_at ? "" : "bg-violet-300/[.025]"}`}><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="text-[9px] font-medium text-slate-200">{item.title}</p><p className="mt-1 text-[9px] leading-4 text-slate-400">{item.body}</p><p className="mt-1 text-[8px] text-slate-600">{when(item.created_at)}</p></div>{!item.read_at && <button type="button" disabled={reading === item.id} onClick={() => void markRead(item.id)} aria-label={`Mark ${item.title} as read`} className="grid size-6 shrink-0 place-items-center rounded-md text-violet-200 transition hover:bg-violet-300/[.09] disabled:opacity-50">{reading === item.id ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}</button>}</div></li>)}</ul>}
    </section>}
  </div>;
}
