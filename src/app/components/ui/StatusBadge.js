'use client';

import { Circle } from 'lucide-react';

export default function StatusBadge({ status, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border bg-zinc-800/40 border-zinc-700/50 text-zinc-400">
        <Circle size={10} className="fill-zinc-500 text-zinc-500 animate-pulse" />
        <span>Conectando...</span>
      </div>
    );
  }

  const isOnline = status?.online;

  return isOnline ? (
    <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border bg-success-dim border-success/30 text-success">
      <Circle size={10} className="fill-success text-success animate-pulse" />
      <span>VPS Online</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full border bg-danger-dim border-danger/30 text-danger">
      <Circle size={10} className="fill-danger text-danger" />
      <span>VPS Offline</span>
    </div>
  );
}
