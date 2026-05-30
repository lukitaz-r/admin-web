'use client';

import { useState } from 'react';
import { FileText, Folder, FolderOpen, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

// Nested Visual Schema Editor
function NestedObjectEditor({ path, value, onChange, level = 0 }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (value === null || value === undefined) {
    const label = path[path.length - 1];
    const displayLabel = isNaN(label) ? label : `Elemento ${Number(label) + 1}`;
    return (
      <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-zinc-550 shrink-0" />
          <span className="font-mono text-zinc-400 font-medium">{displayLabel}:</span>
        </div>
        <span className="text-zinc-550 italic font-mono">nulo</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const isObject = typeof value === 'object' && !isArray;

  if (isObject) {
    const title = path.length === 0 
      ? 'Objeto Principal' 
      : (isNaN(path[path.length - 1]) ? path[path.length - 1] : `Elemento ${Number(path[path.length - 1]) + 1}`);
      
    return (
      <div className={`rounded-xl border border-zinc-800 bg-zinc-950/20 overflow-hidden flex flex-col transition-all duration-200
        ${level === 0 ? 'border-primary/20' : level === 1 ? 'border-sky-500/20' : 'border-purple-500/20'}`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            {isCollapsed ? <ChevronRight size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            {isCollapsed ? <Folder size={14} className="text-zinc-500" /> : <FolderOpen size={14} className="text-primary" />}
            <span className="font-mono">{title}</span>
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
            objeto
          </span>
        </button>

        {!isCollapsed && (
          <div className="p-3 pl-6 border-l border-zinc-850 flex flex-col gap-3 relative before:absolute before:left-2.5 before:top-0 before:bottom-3 before:w-px before:bg-zinc-850">
            {Object.entries(value).map(([childKey, childVal]) => (
              <NestedObjectEditor
                key={childKey}
                path={[...path, childKey]}
                value={childVal}
                onChange={onChange}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isArray) {
    const title = path.length === 0 
      ? 'Lista (Array)' 
      : (isNaN(path[path.length - 1]) ? path[path.length - 1] : `Elemento ${Number(path[path.length - 1]) + 1}`);

    const handleRemoveArrayItem = (index) => {
      const newValue = value.filter((_, i) => i !== index);
      onChange(path, newValue);
    };

    const handleAddArrayItem = () => {
      let newItem = '';
      if (value.length > 0) {
        const template = value[0];
        if (typeof template === 'object' && template !== null) {
          newItem = Array.isArray(template) ? [] : JSON.parse(JSON.stringify(template));
        } else if (typeof template === 'number') {
          newItem = 0;
        } else if (typeof template === 'boolean') {
          newItem = false;
        } else {
          newItem = '';
        }
      }
      const newValue = [...value, newItem];
      onChange(path, newValue);
    };

    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/10 overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
            {isCollapsed ? <ChevronRight size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            <FolderOpen size={14} className="text-sky-400" />
            <span className="font-mono">{title}</span>
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-950/20 text-sky-400">
            {value.length} items
          </span>
        </button>

        {!isCollapsed && (
          <div className="p-3 pl-6 border-l border-zinc-850 flex flex-col gap-3 relative before:absolute before:left-2.5 before:top-0 before:bottom-3 before:w-px before:bg-zinc-850">
            {value.map((childVal, index) => (
              <div key={index} className="flex gap-2 items-start group">
                <div className="flex-1 min-w-0">
                  <NestedObjectEditor
                    path={[...path, String(index)]}
                    value={childVal}
                    onChange={onChange}
                    level={level + 1}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(index)}
                  className="p-2 rounded bg-danger/10 border border-danger/10 text-danger opacity-50 group-hover:opacity-100 transition-opacity hover:bg-danger hover:text-white cursor-pointer"
                  title="Eliminar elemento"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddArrayItem}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-800 border-dashed hover:border-zinc-700 bg-zinc-950/30 text-zinc-400 hover:text-zinc-300 text-xs font-semibold tracking-wide transition-all cursor-pointer mt-1"
            >
              <Plus size={13} /> Agregar Elemento
            </button>
          </div>
        )}
      </div>
    );
  }

  const label = path[path.length - 1];
  const displayLabel = isNaN(label) ? label : `Elemento ${Number(label) + 1}`;

  if (typeof value === 'boolean') {
    return (
      <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/50 transition-all flex items-center justify-between text-xs w-full">
        <div className="flex items-center gap-2 font-mono">
          <FileText size={14} className="text-zinc-550 shrink-0" />
          <span className="text-zinc-350">{displayLabel}</span>
        </div>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="accent-primary h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950 cursor-pointer"
        />
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/50 transition-all flex items-center justify-between gap-4 text-xs w-full">
        <div className="flex items-center gap-2 font-mono shrink-0">
          <FileText size={14} className="text-zinc-550 shrink-0" />
          <span className="text-zinc-350">{displayLabel}</span>
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          className="max-w-[200px] text-right font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
        />
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/50 transition-all flex items-center justify-between gap-4 text-xs w-full">
      <div className="flex items-center gap-2 font-mono shrink-0">
        <FileText size={14} className="text-zinc-550 shrink-0" />
        <span className="text-zinc-350">{displayLabel}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        className="flex-1 text-right font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
      />
    </div>
  );
}

export default function AtlasEditor({
  editingDoc,
  isNewDoc,
  onFieldChange,
  onNestedFieldChange
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.2s_var(--ease-smooth)]">
      {/* ID Field */}
      <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/10 flex flex-col gap-2.5 md:col-span-2">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <FileText size={14} className="text-primary" />
          <span>_id (Identificador Único)</span>
        </div>
        <input
          type="text"
          value={editingDoc._id}
          onChange={(e) => onFieldChange('_id', e.target.value)}
          placeholder="Dejar vacío para auto-generación de UUID"
          disabled={!isNewDoc}
          className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Other fields */}
      {Object.entries(editingDoc)
        .filter(([key]) => key !== '_id' && !key.startsWith('_raw_'))
        .map(([key, val]) => {
          const isComplex = val !== null && typeof val === 'object';

          if (isComplex) {
            return (
              <div key={key} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/10 flex flex-col gap-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                    <FileText size={14} className="text-primary" />
                    <span className="font-mono">{key} (Estructura Anidada)</span>
                  </div>
                </div>
                <NestedObjectEditor
                  path={[]}
                  value={val}
                  onChange={(path, newValue) => onNestedFieldChange(key, path, newValue)}
                />
              </div>
            );
          }

          return (
            <div key={key} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <FileText size={14} className="text-zinc-550" />
                <span className="font-mono">{key}</span>
              </div>
              <input
                type="text"
                value={val === null ? '' : String(val)}
                onChange={(e) => onFieldChange(key, e.target.value)}
                className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
          );
        })}
    </div>
  );
}
