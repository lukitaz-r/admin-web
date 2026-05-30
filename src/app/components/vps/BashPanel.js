'use client';

import { useState } from 'react';
import { Terminal, RotateCcw, Activity, GitBranch, ShieldAlert } from 'lucide-react';
import { VPS_COMMANDS } from '../../lib/constants';

export default function BashPanel({ onExec, loading }) {
  const [outputLog, setOutputLog] = useState('');
  const [showConfirm, setShowConfirm] = useState(null); // command object if waiting confirm

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'RotateCcw': return <RotateCcw size={15} />;
      case 'Activity': return <Activity size={15} />;
      case 'GitBranch': return <GitBranch size={15} />;
      default: return <Terminal size={15} />;
    }
  };

  const handleCommandPress = (cmd) => {
    if (cmd.requiresConfirmation) {
      setShowConfirm(cmd);
    } else {
      executeCommand(cmd.id);
    }
  };

  const executeCommand = async (cmdId) => {
    setShowConfirm(null);
    setOutputLog(prev => prev + `\n$ executing: ${cmdId}...\n`);
    
    const result = await onExec(cmdId);
    
    if (result) {
      setOutputLog(prev => prev + `\n[RESULTADOS]:\n${result.output}\n========================================\n`);
    } else {
      setOutputLog(prev => prev + `\n[ERROR]: Falla de conexión con el VPS del bot.\n========================================\n`);
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-zinc-800 bg-zinc-950/20 rounded-xl p-5 md:p-6 animate-[fadeIn_0.2s_var(--ease-smooth)]">
      {/* Header */}
      <div className="flex flex-col border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Terminal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consola del <span className='text-primary'>Platubot</span></h3>
            <p className="text-xs text-zinc-500 mt-0.5">Ejecuta acciones de mantenimiento en el servidor del bot.</p>
          </div>
        </div>
      </div>

      {/* Button Controls GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(VPS_COMMANDS).map((cmd) => {
          const isDanger = cmd.dangerLevel === 'warning';
          return (
            <button
              key={cmd.id}
              onClick={() => handleCommandPress(cmd)}
              disabled={loading}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer disabled:opacity-50
                ${isDanger
                  ? 'border-warning/15 bg-warning/5 hover:bg-warning/10 hover:border-warning/35'
                  : 'border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg shrink-0
                  ${isDanger ? 'bg-warning/15 text-warning' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}`}
                >
                  {getIcon(cmd.icon)}
                </span>
                <span className="font-bold text-xs text-white tracking-wide">{cmd.label}</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">{cmd.description}</p>
            </button>
          );
        })}
      </div>

      {/* Safety Confirmation Dialog overlay */}
      {showConfirm && (
        <div className="p-4 rounded-xl border border-warning/20 bg-warning-dim text-warning flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-[slideDown_0.2s_var(--ease-smooth)]">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="shrink-0 animate-pulse" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">Confirmación Requerida</h4>
              <p className="text-[10px] text-warning/80 mt-0.5">
                ¿Seguro que deseas ejecutar <strong className="text-white">"{showConfirm.label}"</strong>? Esto puede afectar el bot en vivo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirm(null)}
              className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold tracking-wide transition-all cursor-pointer"
            >
              Abortar
            </button>
            <button
              onClick={() => executeCommand(showConfirm.id)}
              className="px-3 py-1.5 rounded bg-warning text-zinc-950 hover:bg-warning/90 text-[10px] font-extrabold tracking-wide transition-all cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Console Output Log */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider font-mono">Consola Estándar ($ stdout)</span>
        <pre className="w-full h-48 bg-zinc-950 border border-zinc-900 rounded-xl p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-350 select-all">
          {outputLog || '$ esperando acción...'}
        </pre>
      </div>
    </div>
  );
}
