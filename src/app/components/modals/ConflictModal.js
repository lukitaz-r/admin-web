'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useMemo } from 'react';

// Highly-efficient glassmorphic JSON highlighter
function JsonHighlighter({ data }) {
  const jsonString = useMemo(() => {
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }, [data]);

  const highlighted = useMemo(() => {
    if (!jsonString) return '';
    let escaped = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-green-400'; // number default
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-sky-400 font-semibold'; // json key
          } else {
            cls = 'text-amber-300'; // json string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-indigo-400 font-bold'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-indigo-400 opacity-60'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }, [jsonString]);

  return (
    <pre className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[350px] text-zinc-350 select-text">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

export default function ConflictModal({ conflictData, onClose, onDiscard, onForceOverwrite }) {
  if (!conflictData) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_var(--ease-smooth)]">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative shadow-2xl animate-[scaleUp_0.2s_var(--ease-smooth)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-danger/10 text-danger shrink-0">
              <AlertTriangle size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                Conflicto de Edición Detectado
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Otro administrador ha modificado este registro en la base de datos mientras tú lo editabas localmente.
              </p>
            </div>
          </div>
        </div>

        {/* Diff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              Versión en Servidor (Nuevos Cambios)
            </span>
            <JsonHighlighter data={conflictData.serverDoc} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Tus Cambios Locales (Borrador)
            </span>
            <JsonHighlighter data={conflictData.userDoc} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 py-3 px-4 text-xs font-bold rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 transition-all cursor-pointer text-center"
          >
            Descartar Mis Cambios y Recargar
          </button>
          <button
            type="button"
            onClick={() => onForceOverwrite(conflictData.userDoc)}
            className="flex-1 py-3 px-4 text-xs font-bold rounded-lg bg-danger hover:bg-danger/90 text-white hover:shadow-lg hover:shadow-danger/10 transition-all cursor-pointer text-center uppercase tracking-wide"
          >
            Forzar Sobreescritura
          </button>
        </div>
      </div>
    </div>
  );
}
