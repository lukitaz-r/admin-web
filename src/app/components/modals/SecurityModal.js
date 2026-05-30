'use client';

import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export default function SecurityModal({
  isOpen,
  action,
  confirmedChecked,
  setConfirmedChecked,
  inputVerification,
  setInputVerification,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  const isDelete = action === 'delete';
  const confirmationWord = isDelete ? 'ELIMINAR' : 'GUARDAR';

  const isDisabled = !confirmedChecked || inputVerification !== confirmationWord;

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
          <div className="p-3 rounded-full bg-danger/10 text-danger animate-pulse">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            {isDelete ? 'Confirmación de Eliminación' : 'Confirmación de Guardado'}
          </h2>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 text-center">
          <p className="text-sm font-semibold text-zinc-200">
            Estás a punto de {isDelete ? 'eliminar definitivamente' : 'guardar y sobrescribir'} este registro en la base de datos de producción.
          </p>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Esta acción es irreversible y afectará de forma inmediata al funcionamiento de los bots o procesos activos.
          </p>

          {/* Verification steps */}
          <div className="flex flex-col gap-4 border-y border-zinc-800 py-5 text-left">
            {/* Step 1: Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmedChecked}
                onChange={(e) => setConfirmedChecked(e.target.checked)}
                className="mt-0.5 accent-primary h-4 w-4 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
              />
              <span className="text-xs text-zinc-300 group-hover:text-zinc-250 select-none leading-tight font-medium">
                Entiendo los riesgos y confirmo que deseo realizar esta acción en producción.
              </span>
            </label>

            {/* Step 2: TextInput */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-zinc-450 font-medium">
                Escribe <code className="px-1.5 py-0.5 rounded bg-zinc-950 font-mono font-bold text-danger text-[11px] border border-zinc-800">{confirmationWord}</code> para confirmar:
              </label>
              <input
                type="text"
                placeholder={`Escribe ${confirmationWord}`}
                value={inputVerification}
                onChange={(e) => setInputVerification(e.target.value)}
                className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
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
            disabled={isDisabled}
            onClick={onConfirm}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer text-center uppercase tracking-wide
              ${isDisabled
                ? 'bg-zinc-800 text-zinc-550 border-transparent cursor-not-allowed'
                : isDelete
                  ? 'bg-danger text-white hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/10'
                  : 'bg-primary text-zinc-950 hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/10'
              }`}
          >
            <ShieldCheck size={14} /> Confirmar Acción
          </button>
        </div>
      </div>
    </div>
  );
}
