'use client';

import { LogOut, User } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function Topbar({ user, vpsStatus, vpsLoading, onLogout }) {
  return (
    <header className="h-16 border-b border-border bg-glass backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>Platubot Admin</span>
          <span className="text-zinc-600 font-normal">/</span>
          <span className="text-zinc-400 font-medium text-sm">Dashboard</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* VPS Status Badge */}
        <StatusBadge status={vpsStatus} loading={vpsLoading} />

        {/* Vertical divider */}
        <div className="h-4 w-px bg-zinc-800" />

        {/* User profile & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-zinc-800"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-850 flex items-center justify-center border border-zinc-800 text-zinc-400">
                  <User size={16} />
                </div>
              )}
              <span className="text-sm font-semibold text-zinc-200 hidden sm:inline-block">
                {user.username}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
