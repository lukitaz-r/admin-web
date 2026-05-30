'use client';

import { useState } from 'react';
import { Search, Replace, RefreshCw, X } from 'lucide-react';

export default function SearchReplace({
  editingDoc,
  onFieldChange,
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(-1);

  // Scan all fields in document for text search matches
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setMatches([]);
      setCurrentMatchIdx(-1);
      return;
    }

    const foundMatches = [];
    Object.entries(editingDoc).forEach(([key, val]) => {
      if (key.startsWith('_raw_') || key === '_id') return;
      if (typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())) {
        foundMatches.push({ key, type: 'string' });
      }
    });

    setMatches(foundMatches);
    setCurrentMatchIdx(foundMatches.length > 0 ? 0 : -1);
  };

  const handleReplace = () => {
    if (currentMatchIdx === -1 || matches.length === 0) return;
    const match = matches[currentMatchIdx];

    const currentVal = editingDoc[match.key];
    if (typeof currentVal === 'string') {
      const regex = new RegExp(searchQuery, 'gi');
      const newVal = currentVal.replace(regex, replaceQuery);
      onFieldChange(match.key, newVal);
      
      // Re-evaluate search matches
      const updatedMatches = matches.filter((_, idx) => idx !== currentMatchIdx);
      setMatches(updatedMatches);
      setCurrentMatchIdx(updatedMatches.length > 0 ? 0 : -1);
    }
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) return;
    
    matches.forEach((match) => {
      const currentVal = editingDoc[match.key];
      if (typeof currentVal === 'string') {
        const regex = new RegExp(searchQuery, 'gi');
        const newVal = currentVal.replace(regex, replaceQuery);
        onFieldChange(match.key, newVal);
      }
    });

    setMatches([]);
    setCurrentMatchIdx(-1);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md animate-[slideDown_0.2s_var(--ease-smooth)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider flex items-center gap-1.5">
          <Search size={12} /> Buscar y Reemplazar en Documento (Ctrl+H)
        </span>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 text-zinc-500" size={13} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full text-[11px] font-mono bg-zinc-950 border border-zinc-850 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-zinc-700/80 text-zinc-350"
          />
        </div>

        {/* Replace Input */}
        <div className="relative flex-1">
          <Replace className="absolute left-2.5 top-2.5 text-zinc-500" size={13} />
          <input
            type="text"
            placeholder="Reemplazar con..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="w-full text-[11px] font-mono bg-zinc-950 border border-zinc-850 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-zinc-700/80 text-zinc-350"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900/60 text-zinc-300 text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1"
          >
            Buscar
          </button>
          <button
            onClick={handleReplace}
            disabled={currentMatchIdx === -1}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white text-[10px] font-bold tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Reemplazar
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/95 text-zinc-950 text-[10px] font-extrabold tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Reemplazar Todo
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <span className="text-[10px] text-zinc-500 font-mono">
          Coincidencias encontradas: <span className="text-white font-bold">{matches.length}</span> en campos del documento.
        </span>
      )}
    </div>
  );
}
