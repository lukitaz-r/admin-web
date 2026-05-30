'use client';

import { 
  Save, X, LayoutGrid, Table, GitFork, Code, 
  Trash2, Database, ShieldAlert, Sparkles
} from 'lucide-react';
import { EDITOR_MODES } from '../../../lib/constants';

export default function EditorToolbar({
  documentId,
  collectionName,
  activeMode,
  setActiveMode,
  isNewDoc,
  onSave,
  onCancel,
  hasDraft
}) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'LayoutList': return <LayoutGrid size={15} />;
      case 'Table': return <Table size={15} />;
      case 'GitFork': return <GitFork size={15} />;
      case 'Code': return <Code size={15} />;
      default: return <LayoutGrid size={15} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
      {/* Title & Info */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Database size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {isNewDoc ? 'Nuevo Documento en' : 'Editando en'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 font-mono font-bold text-zinc-400">
              {collectionName}
            </span>
            {hasDraft && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-bold flex items-center gap-1">
                <Sparkles size={8} /> BORRADOR LOCAL
              </span>
            )}
          </div>
          <h3 className="text-sm font-mono font-bold text-white mt-1 truncate">
            {isNewDoc ? 'Scaffolding...' : documentId}
          </h3>
        </div>
      </div>

      {/* Mode Selector Tabs & Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
        {/* Editor Tabs */}
        <div className="flex p-0.5 rounded-lg bg-zinc-950/80 border border-zinc-850">
          {Object.values(EDITOR_MODES).map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer
                  ${isActive
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                {getIcon(mode.icon)}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 text-xs font-semibold transition-all cursor-pointer"
          >
            <X size={14} /> Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-zinc-950 text-xs font-extrabold shadow-lg shadow-primary/10 transition-all cursor-pointer"
          >
            <Save size={14} /> Guardar Registro
          </button>
        </div>
      </div>
    </div>
  );
}
