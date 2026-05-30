'use client';

import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Database, ScrollText, Terminal, 
  Search, FolderPlus, FolderClosed, Layers
} from 'lucide-react';
import { SIDEBAR_SECTIONS } from '../../lib/constants';

export default function Sidebar({
  activeSection,
  setActiveSection,
  collections,
  selectedCollection,
  setSelectedCollection,
  onAddNewDocument
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState('');

  // Map icon component dynamically
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Database': return <Database size={18} />;
      case 'ScrollText': return <ScrollText size={18} />;
      case 'Terminal': return <Terminal size={18} />;
      default: return <Layers size={18} />;
    }
  };

  const filteredCollections = collections.filter(col =>
    col.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  return (
    <aside
      className={`border-r border-border bg-glass transition-all duration-300 flex flex-col z-30 shrink-0 relative
        ${isCollapsed ? 'w-[70px]' : 'w-72'}`}
    >
      {/* Sidebar header - Collapsed / expanded indicator */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Layers size={18} />
            </span>
            <span className="font-bold text-sm text-white tracking-wide uppercase">Control Panel</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg border border-border hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-all cursor-pointer
            ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {Object.values(SIDEBAR_SECTIONS).map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer
                ${isActive
                  ? 'bg-primary-dim text-primary border border-primary/20 shadow-lg shadow-primary/5'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent'
                }`}
              title={isCollapsed ? section.label : undefined}
            >
              <span className={`shrink-0 transition-transform group-hover:scale-105
                ${isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'}`}
              >
                {getIcon(section.icon)}
              </span>
              {!isCollapsed && <span className="flex-1 text-left">{section.label}</span>}
            </button>
          );
        })}

        {/* Sub-menu collections under Collections section */}
        {activeSection === 'collections' && !isCollapsed && (
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2 flex-1 min-h-0 animate-[fadeIn_0.2s_var(--ease-smooth)]">
            <div className="px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span>Colecciones</span>
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 font-mono text-[10px] text-zinc-400">
                {collections.length}
              </span>
            </div>

            {/* Collection Search */}
            <div className="relative mx-3 mt-1.5">
              <Search className="absolute left-2.5 top-2.5 text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Buscar colección..."
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                className="w-full text-xs bg-zinc-900/50 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-zinc-700/80 focus:ring-1 focus:ring-zinc-700/80 text-zinc-300 placeholder-zinc-550"
              />
            </div>

            {/* Collection items */}
            <div className="flex-1 overflow-y-auto px-2 mt-2 flex flex-col gap-0.5 max-h-[300px] border border-border rounded-lg bg-glass/20 py-1">
              {filteredCollections.length > 0 ? (
                filteredCollections.map((col) => {
                  const isSelected = selectedCollection === col;
                  return (
                    <button
                      key={col}
                      onClick={() => setSelectedCollection(col)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-left transition-all cursor-pointer
                        ${isSelected
                          ? 'bg-primary-dim text-primary font-bold border border-primary/15'
                          : 'text-zinc-450 hover:text-zinc-200 hover:bg-glass-hover border border-transparent'
                        }`}
                    >
                      <FolderClosed size={12} className={isSelected ? 'text-primary' : 'text-zinc-650'} />
                      <span className="truncate flex-1">{col}</span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-zinc-650 text-xs">
                  No se encontraron colecciones
                </div>
              )}
            </div>

            {/* Action button in sidebar */}
            {selectedCollection && (
              <button
                onClick={onAddNewDocument}
                className="mx-3 mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-primary/20 hover:border-primary/45 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                <FolderPlus size={14} /> Crear Nuevo Registro
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Footer info - collapsed or expanded version */}
      <div className="p-4 border-t border-border flex items-center justify-center">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-medium">Versión Dashboard</span>
              <span className="text-xs font-mono text-zinc-400 font-semibold">v2.0.0</span>
            </div>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-zinc-500 font-bold">v2.0</span>
        )}
      </div>
    </aside>
  );
}
