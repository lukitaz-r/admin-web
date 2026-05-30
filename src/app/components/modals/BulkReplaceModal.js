'use client';

import { useState } from 'react';
import { AlertTriangle, Database, RefreshCw, X } from 'lucide-react';

export default function BulkReplaceModal({
  isOpen,
  documents,
  onClose,
  onConfirm
}) {
  const [targetField, setTargetField] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [previewMatches, setPreviewMatches] = useState(null);

  if (!isOpen) return null;

  // Run preview to show matching documents count
  const handlePreview = () => {
    if (!targetField.trim() || !searchValue.trim()) return;

    let matchCount = 0;
    documents.forEach((doc) => {
      const val = doc[targetField];
      if (val !== undefined && String(val).toLowerCase().includes(searchValue.toLowerCase())) {
        matchCount++;
      }
    });

    setPreviewMatches(matchCount);
  };

  const handleApply = () => {
    if (previewMatches === null || previewMatches === 0) return;
    onConfirm(targetField, searchValue, replaceValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_var(--ease-smooth)]">
      <div className="w-full max-w-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative shadow-2xl animate-[scaleUp_0.2s_var(--ease-smooth)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-full bg-warning/10 text-warning animate-pulse">
            <Database size={32} />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            Reemplazo Masivo en Colección
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Esta acción buscará y reemplazará un valor de forma masiva en todos los documentos de la colección actual.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Nombre del Campo (Key)
            </label>
            <input
              type="text"
              placeholder="Ej: guildId o premium"
              value={targetField}
              onChange={(e) => { setTargetField(e.target.value); setPreviewMatches(null); }}
              className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Valor Actual (Buscar)
            </label>
            <input
              type="text"
              placeholder="Ej: 123456789"
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); setPreviewMatches(null); }}
              className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Nuevo Valor (Reemplazar)
            </label>
            <input
              type="text"
              placeholder="Ej: 987654321"
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          </div>
        </div>

        {/* Run Preview Action */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePreview}
            disabled={!targetField.trim() || !searchValue.trim()}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:text-white transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} /> Calcular Coincidencias
          </button>

          {previewMatches !== null && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs
              ${previewMatches > 0
                ? 'bg-warning-dim border-warning/20 text-warning'
                : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'}`}
            >
              <AlertTriangle size={16} className="shrink-0 animate-pulse" />
              <div className="leading-relaxed">
                {previewMatches > 0 ? (
                  <span>
                    Se encontraron <strong className="font-mono">{previewMatches}</strong> registros coincidentes listos para actualizar en producción.
                  </span>
                ) : (
                  <span>No se encontraron registros coincidentes con los criterios actuales.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-xs font-bold rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={previewMatches === null || previewMatches === 0}
            onClick={handleApply}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer text-center uppercase tracking-wide
              ${(previewMatches === null || previewMatches === 0)
                ? 'bg-zinc-850 text-zinc-550 border-transparent cursor-not-allowed'
                : 'bg-warning text-zinc-950 hover:bg-warning/90 hover:shadow-lg hover:shadow-warning/10 font-black'
              }`}
          >
            Aplicar Reemplazo Masivo
          </button>
        </div>
      </div>
    </div>
  );
}
