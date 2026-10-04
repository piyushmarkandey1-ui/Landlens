'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ExternalLink, X } from 'lucide-react';
import { getNotifications } from '@/lib/operations';

const tone: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-amber-400',
  info: 'bg-cyan-400',
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const notifications = getNotifications().filter(item => !dismissed.includes(item.id));
  const unread = notifications.filter(item => !item.read).length;

  return <div className="relative">
    <button onClick={() => setOpen(value => !value)} className="relative p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Notification center"><Bell size={15} />{unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{unread}</span>}</button>
    {open && <div className="absolute right-0 top-9 z-50 w-[360px] rounded-xl border border-indigo-500/25 bg-slate-950 shadow-2xl shadow-black/60 overflow-hidden"><div className="px-3 py-2.5 border-b border-indigo-950/50 flex items-center justify-between"><div><div className="text-sm text-white font-semibold">Notification center</div><div className="text-[10px] text-slate-600">Operational events and data alerts</div></div><div className="flex gap-1"><button className="p-1 text-slate-600 hover:text-slate-300" title="Mark all read"><CheckCheck size={13} /></button><button onClick={() => setOpen(false)} className="p-1 text-slate-600 hover:text-slate-300"><X size={13} /></button></div></div><div className="max-h-[400px] overflow-y-auto">{notifications.map(item => <div key={item.id} className={`p-3 border-b border-slate-800/50 ${!item.read ? 'bg-indigo-500/5' : ''}`}><div className="flex items-start gap-2"><span className={`w-1.5 h-1.5 rounded-full ${tone[item.severity]} mt-1.5 flex-shrink-0`} /><div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><Link href={item.href} onClick={() => setOpen(false)} className="text-xs text-slate-200 font-medium hover:text-indigo-300">{item.title}</Link><button onClick={() => setDismissed(current => [...current, item.id])} className="text-slate-700 hover:text-slate-400"><X size={11} /></button></div><div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</div><div className="flex items-center justify-between mt-1.5"><span className="text-[10px] text-slate-700">{new Date(item.timestamp).toLocaleString('en-IN')}</span><Link href={item.href} onClick={() => setOpen(false)} className="text-[10px] text-indigo-400 flex items-center gap-1">Open <ExternalLink size={9} /></Link></div></div></div></div>)}{notifications.length === 0 && <div className="p-6 text-center text-xs text-slate-600">No active notifications.</div>}</div></div>}
  </div>;
}
