'use client';

import { FileEdit, Check, Trash2 } from 'lucide-react';

export default function DraftBanner({ draftDetected, onLoad, onDiscard }) {
  if (!draftDetected) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-warning/20 bg-warning-dim text-warning animate-[slideDown_0.2s_var(--ease-smooth)]">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/10 shrink-0">
          <FileEdit size={18} />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Borrador Local Detectado</h4>
          <p className="text-xs text-warning/80 mt-0.5">
            Tenés cambios sin guardar para el documento <code className="px-1.5 py-0.5 rounded bg-warning/10 font-mono font-medium">{draftDetected.id}</code> del {new Date(draftDetected.timestamp).toLocaleTimeString()}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={onDiscard}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-warning/20 hover:bg-warning/10 text-xs font-semibold transition-all cursor-pointer"
        >
          <Trash2 size={14} /> Descartar
        </button>
        <button
          onClick={onLoad}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning text-zinc-950 hover:bg-warning/90 text-xs font-semibold shadow-lg shadow-warning/15 transition-all cursor-pointer"
        >
          <Check size={14} /> Cargar Borrador
        </button>
      </div>
    </div>
  );
}
