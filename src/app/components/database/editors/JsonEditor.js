'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Code, Eye } from 'lucide-react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

export default function JsonEditor({
  editingDoc,
  onFieldChange
}) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [error, setError] = useState(null);

  // Clean document without _raw_ fields
  const cleanDoc = useMemo(() => {
    const doc = { ...editingDoc };
    Object.keys(doc).forEach(key => {
      if (key.startsWith('_raw_')) delete doc[key];
    });
    return doc;
  }, [editingDoc]);

  // Initial stringified doc
  const initialDocString = useMemo(() => JSON.stringify(cleanDoc, null, 2), [cleanDoc]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize CodeMirror
    const startState = EditorState.create({
      doc: initialDocString,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        json(),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.theme({
          "&": {
            backgroundColor: "transparent !important",
            height: "100%",
            fontSize: "12px",
            fontFamily: "var(--font-mono)"
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily: "var(--font-mono)"
          },
          ".cm-gutters": {
            backgroundColor: "transparent",
            color: "#6b7280",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          },
          "&.cm-focused": {
            outline: "none"
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(255,255,255,0.03)"
          },
          ".cm-activeLineGutter": {
            backgroundColor: "rgba(255,255,255,0.05)"
          }
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const val = update.state.doc.toString();
            try {
              const parsed = JSON.parse(val);
              setError(null);
              // Bubble changes up
              Object.entries(parsed).forEach(([key, value]) => {
                onFieldChange(key, value);
              });
            } catch (err) {
              setError(err.message);
            }
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Run once on mount

  // Update editor if external doc changes (e.g. another user edit)
  useEffect(() => {
    if (viewRef.current) {
      const currentVal = viewRef.current.state.doc.toString();
      if (currentVal !== initialDocString) {
        try {
          // Only update if fundamentally different to avoid cursor jumps
          if (JSON.stringify(JSON.parse(currentVal)) !== JSON.stringify(JSON.parse(initialDocString))) {
            viewRef.current.dispatch({
              changes: { from: 0, to: currentVal.length, insert: initialDocString }
            });
          }
        } catch(e) {
          // If current is invalid, just overwrite
          viewRef.current.dispatch({
            changes: { from: 0, to: currentVal.length, insert: initialDocString }
          });
        }
      }
    }
  }, [initialDocString]);

  return (
    <div className="flex flex-col gap-3 animate-[fadeIn_0.2s_var(--ease-smooth)] w-full h-full min-h-[500px]">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-primary" />
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Editor JSON Avanzado
          </span>
        </div>
        {error ? (
          <span className="text-danger font-semibold flex items-center gap-1.5 bg-danger/10 px-2 py-1 rounded-lg">
            <AlertCircle size={14} /> JSON Inválido
          </span>
        ) : (
          <span className="text-success font-semibold flex items-center gap-1.5 bg-success/10 px-2 py-1 rounded-lg">
            <CheckCircle2 size={14} /> JSON Válido
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
        <div 
          ref={editorRef} 
          className="flex-1 overflow-y-auto w-full h-[500px]"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-danger/20 bg-danger/5 text-danger text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}
    </div>
  );
}
