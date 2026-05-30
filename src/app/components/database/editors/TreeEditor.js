'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Folder, FolderOpen,
  Hash, Type, ToggleLeft, CircleDot, Braces, List,
  Plus, Trash2, GitFork
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   HORIZONTAL RAIL
   Measures first/last child positions and draws 
   a horizontal line connecting them via absolute positioning
   ═══════════════════════════════════════════════════ */
function HorizontalRail({ containerRef, childCount }) {
  const [style, setStyle] = useState({ display: 'none' });

  const measure = useCallback(() => {
    if (childCount <= 1 || !containerRef.current) {
      setStyle({ display: 'none' });
      return;
    }
    const container = containerRef.current;
    const wraps = container.querySelectorAll(':scope > .tree-child-wrap');
    if (wraps.length < 2) {
      setStyle({ display: 'none' });
      return;
    }

    const first = wraps[0];
    const last = wraps[wraps.length - 1];
    const containerRect = container.getBoundingClientRect();
    const firstCenter = first.getBoundingClientRect().left + first.getBoundingClientRect().width / 2 - containerRect.left;
    const lastCenter = last.getBoundingClientRect().left + last.getBoundingClientRect().width / 2 - containerRect.left;

    setStyle({
      position: 'absolute',
      top: '14px',
      left: `${firstCenter}px`,
      width: `${lastCenter - firstCenter}px`,
      height: '1px',
      background: 'rgba(255, 255, 255, 0.1)',
      display: 'block',
      zIndex: 1,
    });
  }, [childCount]);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;

    // Observe size changes in the container (when a child expands/collapses)
    const observer = new ResizeObserver(() => {
      measure();
    });
    
    observer.observe(container);
    window.addEventListener('resize', measure);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Fallback timeout for animations
  useEffect(() => {
    const t = setTimeout(measure, 300);
    return () => clearTimeout(t);
  }, [childCount, measure]);

  if (childCount <= 1) return null;
  return <div style={style} />;
}

/* ═══════════════════════════════════════════════════
   LEAF NODE — renders an editable primitive value
   ═══════════════════════════════════════════════════ */
function LeafNode({ label, value, path, onChange }) {
  const isId = label === '_id';

  const typeLabel = value === null ? 'null'
    : typeof value === 'boolean' ? 'bool'
    : typeof value === 'number' ? 'num'
    : 'str';

  const typeIcon = value === null ? <CircleDot size={11} className="text-zinc-600" />
    : typeof value === 'boolean' ? <ToggleLeft size={11} className="text-amber-400" />
    : typeof value === 'number' ? <Hash size={11} className="text-emerald-400" />
    : <Type size={11} className="text-sky-400" />;

  return (
    <div className="tree-node">
      <div className={`tree-card tree-card--leaf ${isId ? 'border-primary/30! bg-primary/5!' : ''}`}>
        {/* Label row */}
        <div className="flex items-center gap-1.5">
          {typeIcon}
          <span className={`font-bold text-[0.62rem] ${isId ? 'text-primary' : 'text-zinc-400'}`}>{label}</span>
          <span className="text-[0.48rem] uppercase tracking-wider font-extrabold text-zinc-600 bg-zinc-900 px-1 py-px rounded">
            {typeLabel}
          </span>
        </div>

        {/* Value editor */}
        <div className="mt-1">
          {isId ? (
            <span className="text-[0.58rem] text-primary/60 select-all">{String(value)}</span>
          ) : value === null ? (
            <span className="text-[0.58rem] text-zinc-600 italic">null</span>
          ) : typeof value === 'boolean' ? (
            <button
              type="button"
              onClick={() => onChange(path, !value)}
              className={`tree-toggle ${value ? 'tree-toggle--on' : 'tree-toggle--off'}`}
            >
              <div className="tree-toggle-knob" />
            </button>
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(path, Number(e.target.value))}
              className="tree-input tree-input--number"
            />
          ) : (
            <input
              type="text"
              value={String(value)}
              onChange={(e) => onChange(path, e.target.value)}
              className="tree-input tree-input--string"
              style={{ width: `${Math.max(50, Math.min(150, String(value).length * 7 + 20))}px` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BRANCH NODE — collapsible object/array node
   ═══════════════════════════════════════════════════ */
function BranchNode({ label, value, path, onChange, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const childrenRef = useRef(null);
  const cardRef = useRef(null);

  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 260);
  };

  const handleAddItem = () => {
    if (!isArray) return;
    let newItem = '';
    if (value.length > 0) {
      const template = value[0];
      if (typeof template === 'object' && template !== null) {
        newItem = Array.isArray(template) ? [] : JSON.parse(JSON.stringify(template));
      } else if (typeof template === 'number') {
        newItem = 0;
      } else if (typeof template === 'boolean') {
        newItem = false;
      }
    }
    onChange(path, [...value, newItem]);
  };

  const handleRemoveItem = (index) => {
    onChange(path, value.filter((_, i) => i !== index));
  };

  const depthMod = depth % 5; // cycles through 5 color variations

  return (
    <div className="tree-node">
      {/* Branch card */}
      <div
        ref={cardRef}
        className="tree-card tree-card--branch"
        data-depth={depthMod}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-1.5">
          {isOpen
            ? <><ChevronDown size={11} className="text-zinc-500" /><FolderOpen size={12} /></>
            : <><ChevronRight size={11} className="text-zinc-500" /><Folder size={12} className="text-zinc-500" /></>
          }
          <span className="font-bold text-[0.65rem]">{label}</span>
        </div>
        <span className="text-[0.48rem] uppercase tracking-wider font-extrabold text-zinc-500 bg-zinc-900/60 px-1.5 py-px rounded">
          {isArray ? `array [${value.length}]` : `object {${entries.length}}`}
        </span>
        {!isOpen && (
          <span className="tree-collapsed-text">
            {isArray
              ? `${value.length} items`
              : entries.slice(0, 3).map(([k]) => k).join(', ') + (entries.length > 3 ? '…' : '')
            }
          </span>
        )}
      </div>

      {/* Children */}
      {isOpen && (
        <div
          className="tree-children"
          data-count={entries.length}
          ref={childrenRef}
        >
          <HorizontalRail containerRef={childrenRef} childCount={entries.length} />

          {entries.map(([childKey, childVal], idx) => {
            const childPath = [...path, childKey];
            const isComplex = childVal !== null && typeof childVal === 'object';
            const displayLabel = isArray ? `[${childKey}]` : childKey;

            return (
              <div key={childKey} className="tree-child-wrap">
                {/* Delete button for array items */}
                {isArray && (
                  <button
                    type="button"
                    className="tree-btn-del"
                    onClick={(e) => { e.stopPropagation(); handleRemoveItem(idx); }}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                )}

                {isComplex ? (
                  <BranchNode
                    label={displayLabel}
                    value={childVal}
                    path={childPath}
                    onChange={onChange}
                    depth={depth + 1}
                  />
                ) : (
                  <LeafNode
                    label={displayLabel}
                    value={childVal}
                    path={childPath}
                    onChange={onChange}
                  />
                )}
              </div>
            );
          })}

          {/* Add button for arrays */}
          {isArray && (
            <div className="tree-child-wrap">
              <button
                type="button"
                className="tree-btn-add"
                onClick={(e) => { e.stopPropagation(); handleAddItem(); }}
              >
                <Plus size={10} className="inline -mt-px" /> Agregar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TREE EDITOR — main export
   ═══════════════════════════════════════════════════ */
export default function TreeEditor({
  editingDoc,
  isNewDoc,
  onFieldChange,
  onNestedFieldChange
}) {
  const cleanDoc = { ...editingDoc };
  Object.keys(cleanDoc).forEach(key => {
    if (key.startsWith('_raw_')) delete cleanDoc[key];
  });

  const handleChange = useCallback((path, newValue) => {
    if (!path.length) return;
    const rootKey = path[0];
    if (path.length === 1) {
      onFieldChange?.(rootKey, newValue);
    } else {
      onNestedFieldChange?.(rootKey, path.slice(1), newValue);
    }
  }, [onFieldChange, onNestedFieldChange]);

  const entries = Object.entries(cleanDoc);
  const childrenRef = useRef(null);

  return (
    <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_var(--ease-smooth)]">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <GitFork size={14} className="text-primary" />
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Árbol Interactivo de Esquema
        </span>
      </div>

      {/* Tree viewport — scrollable for wide trees */}
      <div className="tree-viewport border border-zinc-800/60 rounded-2xl bg-zinc-950/30">
        <div className="tree-node">
          {/* Root card */}
          <div
            className="tree-card tree-card--branch"
            data-depth="0"
            style={{ cursor: 'default' }}
          >
            <div className="flex items-center gap-1.5">
              <Braces size={12} className="text-primary" />
              <span className="font-bold text-[0.65rem] text-primary">documento</span>
            </div>
            <span className="text-[0.48rem] uppercase tracking-wider font-extrabold text-zinc-500 bg-zinc-900/60 px-1.5 py-px rounded">
              root {`{${entries.length}}`}
            </span>
          </div>

          {/* Root children */}
          <div
            className="tree-children"
            data-count={entries.length}
            ref={childrenRef}
          >
            <HorizontalRail containerRef={childrenRef} childCount={entries.length} />

            {entries.map(([key, val]) => {
              const isComplex = val !== null && typeof val === 'object';
              return (
                <div key={key} className="tree-child-wrap">
                  {isComplex ? (
                    <BranchNode
                      label={key}
                      value={val}
                      path={[key]}
                      onChange={handleChange}
                      depth={1}
                    />
                  ) : (
                    <LeafNode
                      label={key}
                      value={val}
                      path={[key]}
                      onChange={handleChange}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
