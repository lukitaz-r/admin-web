'use client';

import { FileText, Edit2, AlertCircle } from 'lucide-react';

export default function TableEditor({
  editingDoc,
  onFieldChange
}) {
  const fields = Object.entries(editingDoc).filter(([key]) => !key.startsWith('_raw_'));

  const getType = (val) => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  return (
    <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl overflow-hidden animate-[fadeIn_0.2s_var(--ease-smooth)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-450 uppercase font-semibold border-b border-zinc-800 font-mono tracking-wider">
              <th className="p-4 w-[25%]">Campo (Clave)</th>
              <th className="p-4 w-[15%]">Tipo</th>
              <th className="p-4">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 font-mono">
            {fields.map(([key, val]) => {
              const type = getType(val);
              const isId = key === '_id';
              const isComplex = type === 'object' || type === 'array';

              return (
                <tr key={key} className="hover:bg-zinc-900/10 transition-colors group">
                  {/* Key */}
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className={isId ? 'text-primary' : 'text-zinc-550'} />
                      <span className={`font-semibold ${isId ? 'text-primary' : 'text-zinc-200'}`}>{key}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-4 align-middle">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                      ${isId ? 'bg-primary-dim text-primary' :
                        type === 'object' ? 'bg-purple-950/30 text-purple-400' :
                        type === 'array' ? 'bg-sky-950/30 text-sky-400' :
                        type === 'boolean' ? 'bg-amber-950/30 text-amber-400' :
                        'bg-zinc-800 text-zinc-450'}`}
                    >
                      {type}
                    </span>
                  </td>

                  {/* Value Input */}
                  <td className="p-4 align-middle">
                    {isComplex ? (
                      <div className="flex items-center gap-2 text-zinc-550 italic text-[11px] py-1.5 px-3 rounded-lg border border-zinc-850 bg-zinc-950/50 max-w-md">
                        <AlertCircle size={14} />
                        <span>Estructuras complejas se editan en modo Atlas o JSON.</span>
                      </div>
                    ) : (
                      <input
                        type={type === 'number' ? 'number' : type === 'boolean' ? 'checkbox' : 'text'}
                        checked={type === 'boolean' ? !!val : undefined}
                        value={type !== 'boolean' ? (val === null ? '' : String(val)) : undefined}
                        disabled={isId}
                        onChange={(e) => {
                          const newVal = type === 'boolean' ? e.target.checked : type === 'number' ? Number(e.target.value) : e.target.value;
                          onFieldChange(key, newVal);
                        }}
                        className={`w-full max-w-xl text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-1.5 text-zinc-250 placeholder-zinc-750 focus:outline-none focus:border-zinc-700
                          ${type === 'boolean' ? 'h-4.5 w-4.5 accent-primary cursor-pointer' : ''}
                          ${isId ? 'opacity-55 cursor-not-allowed border-transparent bg-transparent pl-0' : ''}`}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
