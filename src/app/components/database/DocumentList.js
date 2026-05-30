'use client';

import { Search, Edit, Trash2, FolderOpen, Plus } from 'lucide-react';

export default function DocumentList({
  collectionName,
  documents,
  searchQuery,
  setSearchQuery,
  onSelectDoc,
  onDeleteDoc,
  onAddNewDocument
}) {
  return (
    <div className="flex flex-col gap-4 w-full h-full animate-[fadeIn_0.2s_var(--ease-smooth)]">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="text-primary" size={20} />
            <span>Colección:</span>
            <span className="font-mono text-primary text-lg">{collectionName}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Administrá todos los documentos registrados en esta colección.
          </p>
        </div>

        <button
          onClick={onAddNewDocument}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary/95 text-zinc-950 font-bold text-xs shadow-lg shadow-primary/10 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} /> Crear Registro
        </button>
      </div>

      {/* Search Bar / Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Buscar registros por valor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-zinc-950/40 border border-zinc-800/80 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-zinc-300 placeholder-zinc-500 transition-all"
          />
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          Registros: <span className="text-white font-semibold font-mono">{documents.length}</span>
        </div>
      </div>

      {/* Grid of Documents */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {documents.map((doc) => {
            const docId = doc._id;
            return (
              <div
                key={docId}
                className="group p-6 rounded-2xl border border-border bg-glass hover:bg-glass-hover hover:border-primary-hover hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between gap-5 animate-[fadeIn_0.2s_var(--ease-smooth)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[9px] font-extrabold text-zinc-550 uppercase tracking-widest">ID del Documento</span>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {typeof docId === 'number' ? 'int' : 'string'}
                    </span>
                  </div>
                  
                  {/* Distinct ID Container */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900/60">
                    <code className="font-mono text-xs text-zinc-300 font-bold select-all break-all block leading-relaxed">
                      {docId}
                    </code>
                  </div>

                  {/* Staggered Vertical Fields (Spacious & Readable) */}
                  <div className="mt-5 space-y-4 border-t border-zinc-900/60 pt-4 flex flex-col">
                    {Object.entries(doc)
                      .filter(([key]) => key !== '_id' && key !== '_modelInfo' && !key.startsWith('_raw_'))
                      .slice(0, 3)
                      .map(([key, val]) => {
                        const valString = typeof val === 'object' ? JSON.stringify(val) : String(val);
                        return (
                          <div key={key} className="flex flex-col gap-1 text-left">
                            <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider font-mono">
                              {key}
                            </span>
                            <span className="text-xs font-mono text-zinc-300 wrap-break-word leading-relaxed select-all">
                              {valString || <span className="text-zinc-650 italic text-[10px]">Vacío</span>}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="flex gap-2.5 border-t border-zinc-900/60 pt-4 mt-2 justify-end">
                  <button
                    onClick={() => onDeleteDoc(doc)}
                    className="flex items-center justify-center p-2.5 rounded-lg border border-danger/15 hover:border-danger/40 hover:bg-danger-dim text-zinc-450 hover:text-danger transition-all cursor-pointer"
                    title="Eliminar documento"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => onSelectDoc(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border hover:border-border-hover bg-glass hover:bg-glass-hover text-zinc-350 hover:text-white text-xs font-bold tracking-wide transition-all cursor-pointer"
                  >
                    <Edit size={14} /> Editar Documento
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/20 text-center px-4 animate-[fadeIn_0.2s_var(--ease-smooth)]">
          <FolderOpen size={48} className="text-zinc-750 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-400">Sin documentos</h3>
          <p className="text-xs text-zinc-650 max-w-xs mt-1">
            No encontramos registros en esta colección {searchQuery ? 'que coincidan con tu búsqueda' : ''}.
          </p>
        </div>
      )}
    </div>
  );
}
