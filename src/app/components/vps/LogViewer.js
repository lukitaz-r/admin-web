'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollText, RefreshCw, AlertTriangle, ArrowDown } from 'lucide-react';
import { LOG_POLL_INTERVALS } from '../../lib/constants';

export default function LogViewer({ logs, loading, onFetch }) {
  const [pollInterval, setPollInterval] = useState('5s');
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef(null);

  // Poll handler
  useEffect(() => {
    const intervalMs = LOG_POLL_INTERVALS[pollInterval];
    if (!intervalMs) return;

    const timer = setInterval(() => {
      onFetch();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [pollInterval, onFetch]);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Colorize log text dynamically
  const colorizeLog = (text) => {
    if (!text) return '';

    return text
      .split('\n')
      .map((line, idx) => {
        let cls = 'text-zinc-400';
        if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail') || line.includes('[API Server Error]')) {
          cls = 'text-danger font-semibold bg-danger/5 px-1.5 rounded';
        } else if (line.toLowerCase().includes('warn') || line.includes('deferring') || line.includes('debounce')) {
          cls = 'text-warning font-semibold bg-warning/5 px-1.5 rounded';
        } else if (line.toLowerCase().includes('success') || line.includes('running') || line.includes('ready') || line.includes('online')) {
          cls = 'text-success font-semibold bg-success/5 px-1.5 rounded';
        } else if (line.includes('[API Request]') || line.includes('[DB Change]')) {
          cls = 'text-primary';
        }

        return (
          <div key={idx} className={`py-0.5 font-mono text-[11px] leading-relaxed break-all ${cls}`}>
            {line}
          </div>
        );
      });
  };

  return (
    <div className="flex flex-col gap-4 border border-zinc-800 bg-zinc-950/20 rounded-xl p-5 md:p-6 animate-[fadeIn_0.2s_var(--ease-smooth)]">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <ScrollText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Logs <span className='text-primary'>Platubot</span></h3>
            <p className="text-xs text-zinc-500 mt-0.5">Monitorea los procesos y solicitudes del bot en tiempo real.</p>
          </div>
        </div>

        {/* Polling Selection & Refresh Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Polling Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Intervalo:</span>
            <select
              value={pollInterval}
              onChange={(e) => setPollInterval(e.target.value)}
              className="text-xs bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
            >
              <option value="5s">5 Segundos</option>
              <option value="10s">10 Segundos</option>
              <option value="30s">30 Segundos</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onFetch}
            disabled={loading}
            className="p-2 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-750 transition-all cursor-pointer disabled:opacity-50"
            title="Refrescar logs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="relative">
        <div className="w-full h-96 bg-zinc-950 border border-zinc-900 rounded-xl p-4 overflow-y-auto flex flex-col font-mono shadow-inner select-text">
          {logs ? colorizeLog(logs) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-650">
              <ScrollText size={32} className="mb-2 opacity-50" />
              <span className="text-xs">No hay logs cargados. Pulsa refrescar.</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Auto Scroll Overlay Button */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`absolute bottom-4 right-4 p-2 rounded-lg border text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer
            ${autoScroll
              ? 'bg-primary text-zinc-950 border-transparent hover:bg-primary/90 shadow-primary/10'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-850'
            }`}
        >
          <ArrowDown size={12} className={autoScroll ? 'animate-bounce' : ''} />
          <span>Auto-Scroll {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
}
