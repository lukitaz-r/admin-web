'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LogOut, Database, Search, Plus, Edit, Trash2, 
  Save, X, RefreshCw, AlertTriangle, Check, User,
  Folder, FolderOpen, FileText, ChevronDown, ChevronRight
} from 'lucide-react/dist/cjs/lucide-react';

// Helper to recursively update a value in a nested object
function setNestedValue(obj, path, value) {
  if (path.length === 0) return value;
  
  const isArray = Array.isArray(obj);
  const newObj = isArray ? [...obj] : { ...obj };
  
  const [head, ...tail] = path;
  newObj[head] = setNestedValue(obj[head], tail, value);
  return newObj;
}

// VS Code themed JSON Syntax Highlighter
function JsonHighlighter({ data }) {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  
  const highlighted = useMemo(() => {
    if (!jsonString) return '';
    
    let escaped = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }, [jsonString]);

  return (
    <pre className="vscode-editor-pre">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

// Recursive Visual Schema Editor for nested objects
function NestedObjectEditor({ path, value, onChange, level = 0 }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (value === null || value === undefined) {
    const label = path[path.length - 1];
    const displayLabel = isNaN(label) ? label : `Elemento ${Number(label) + 1}`;
    return (
      <div className="editor-field-card primitive-card animate-fade-in">
        <div className="nested-field-row">
          <div className="field-label-container">
            <FileText size={14} className="file-icon text-muted" />
            <span className="nested-field-label">{displayLabel}:</span>
          </div>
          <span className="empty-cell">Nulo</span>
        </div>
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
      <div className={`nested-object-box level-${level % 3} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="nested-object-header clickable-header" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="header-left">
            {isCollapsed ? (
              <>
                <ChevronRight size={14} className="folder-chevron" />
                <Folder size={16} className="folder-icon-main" />
              </>
            ) : (
              <>
                <ChevronDown size={14} className="folder-chevron" />
                <FolderOpen size={16} className="folder-icon-main folder-open" />
              </>
            )}
            <span className="nested-object-title">{title}</span>
          </div>
          <span className="folder-type-badge">objeto</span>
        </div>
        {!isCollapsed && (
          <div className="nested-object-body animate-fade-in">
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
      <div className={`nested-object-box array-box level-${level % 3} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="nested-object-header array-header clickable-header" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className="header-left">
            {isCollapsed ? (
              <>
                <ChevronRight size={14} className="folder-chevron" />
                <Folder size={16} className="folder-icon-main" />
              </>
            ) : (
              <>
                <ChevronDown size={14} className="folder-chevron" />
                <FolderOpen size={16} className="folder-icon-main folder-open" />
              </>
            )}
            <span className="nested-object-title">{title}</span>
          </div>
          <span className="folder-type-badge array-badge">{value.length} elementos</span>
        </div>
        {!isCollapsed && (
          <div className="nested-object-body array-body animate-fade-in">
            {value.map((childVal, index) => (
              <div key={index} className="array-item-wrapper animate-fade-in">
                <div className="array-item-content">
                  <NestedObjectEditor
                    path={[...path, String(index)]}
                    value={childVal}
                    onChange={onChange}
                    level={level + 1}
                  />
                </div>
                <button
                  type="button"
                  className="array-item-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveArrayItem(index);
                  }}
                  title="Eliminar elemento"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn sec-btn btn-sm add-array-item-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddArrayItem();
              }}
            >
              <Plus size={14} /> Agregar Elemento
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
      <div className="editor-field-card primitive-card animate-fade-in">
        <div className="nested-field-row checkbox-row">
          <div className="field-label-container">
            <FileText size={14} className="file-icon text-muted" />
            <span className="nested-field-label">{displayLabel}</span>
          </div>
          <div className="field-input-wrapper">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={value}
                onChange={e => onChange(path, e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="editor-field-card primitive-card animate-fade-in">
        <div className="nested-field-row">
          <div className="field-label-container">
            <FileText size={14} className="file-icon text-muted" />
            <label className="nested-field-label">{displayLabel}</label>
          </div>
          <div className="field-input-wrapper">
            <input
              type="number"
              value={value}
              onChange={e => onChange(path, Number(e.target.value))}
              className="form-input nested-input"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-field-card primitive-card animate-fade-in">
      <div className="nested-field-row">
        <div className="field-label-container">
          <FileText size={14} className="file-icon text-muted" />
          <label className="nested-field-label">{displayLabel}</label>
        </div>
        <div className="field-input-wrapper">
          <input
            type="text"
            value={value}
            onChange={e => onChange(path, e.target.value)}
            className="form-input nested-input"
          />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI States
  const [editingDoc, setEditingDoc] = useState(null); // Document currently being edited
  const [isNewDoc, setIsNewDoc] = useState(false); // Creating a new document
  const [statusMessage, setStatusMessage] = useState(null); // Success/Error alert status
  
  // Active editor modes ('visual' | 'raw') for complex JSON keys
  const [editorModes, setEditorModes] = useState({});

  const handleNestedFieldChange = (parentKey, path, newValue) => {
    setEditingDoc(prev => {
      const parentVal = prev[parentKey] || {};
      const updatedParentVal = setNestedValue(parentVal, path, newValue);
      return {
        ...prev,
        [parentKey]: updatedParentVal,
        [`_raw_${parentKey}`]: JSON.stringify(updatedParentVal, null, 2)
      };
    });
  };

  // Offline-first and Concurrency Control States
  const [isOnline, setIsOnline] = useState(true);
  const [originalDocState, setOriginalDocState] = useState(null);
  const [draftDetected, setDraftDetected] = useState(null); // { doc, original }
  const [conflictModal, setConflictModal] = useState(null); // { serverDoc, userDoc }

  // Monitor network status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      showStatus('success', 'Conexión restablecida. Sincronización activa.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showStatus('error', 'Sin conexión a internet. Guardados bloqueados.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save drafts to localStorage
  useEffect(() => {
    if (editingDoc && selectedCollection) {
      const docId = editingDoc._id || 'new';
      localStorage.setItem(`platubot_draft_${selectedCollection}_${docId}`, JSON.stringify(editingDoc));
    }
  }, [editingDoc, selectedCollection]);

  const clearDraft = (colName, id) => {
    const docId = id || 'new';
    localStorage.removeItem(`platubot_draft_${colName}_${docId}`);
  };
  
  // Double Verification Security States
  const [securityModal, setSecurityModal] = useState({
    isOpen: false,
    action: null, // 'save' | 'delete'
    targetData: null,
    confirmedChecked: false,
    inputVerification: ''
  });

  // Fetch all database collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Fetch documents whenever the selected collection changes
  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection);
    }
  }, [selectedCollection]);

  // Alert dismisser
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database');
      if (!res.ok) throw new Error('No se pudieron obtener las colecciones');
      const data = await res.json();
      setCollections(data.collections || []);
      if (data.collections?.length > 0) {
        setSelectedCollection(data.collections[0]);
      }
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (collectionName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/database/${collectionName}`);
      if (!res.ok) throw new Error('No se pudieron obtener los registros');
      const data = await res.json();
      setDocuments(data || []);
    } catch (err) {
      showStatus('error', err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
  };

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => {
      return Object.entries(doc).some(([key, val]) => {
        if (key === '_modelInfo') return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [documents, searchQuery]);

  // Form handling functions
  // Form handling functions
  const handleOpenEdit = (doc) => {
    // Clone doc without private attributes
    const cleanDoc = { ...doc };
    delete cleanDoc._modelInfo;

    // Store original document state for concurrency comparison
    setOriginalDocState(JSON.parse(JSON.stringify(cleanDoc)));

    const docId = cleanDoc._id || 'new';
    const draftKey = `platubot_draft_${selectedCollection}_${docId}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      setDraftDetected({
        doc: JSON.parse(savedDraft),
        original: cleanDoc
      });
      setEditingDoc(cleanDoc); // Load server version first, but show warning banner
    } else {
      setEditingDoc(cleanDoc);
      setDraftDetected(null);
    }
    setIsNewDoc(false);
  };

  const handleOpenCreate = () => {
    // Scaffold basic document with ID
    const scaffold = { _id: '' };
    // Pre-populate with typical keys from other documents if available
    if (documents.length > 0) {
      Object.keys(documents[0]).forEach(key => {
        if (key !== '_id' && key !== '_modelInfo') {
          scaffold[key] = typeof documents[0][key] === 'object' ? (Array.isArray(documents[0][key]) ? [] : {}) : '';
        }
      });
    }
    setEditingDoc(scaffold);
    setIsNewDoc(true);
  };

  const handleFieldChange = (key, value) => {
    setEditingDoc(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleComplexFieldChange = (key, rawJsonString) => {
    // Keep it as a raw string temporarily for editing
    setEditingDoc(prev => ({
      ...prev,
      [`_raw_${key}`]: rawJsonString
    }));
  };

  // security authentication check triggers
  // security authentication check triggers
  const triggerSaveVerification = async (e) => {
    e.preventDefault();
    
    // Parse complex fields back into JSON
    const finalizedDoc = { ...editingDoc };
    let jsonError = null;

    Object.keys(finalizedDoc).forEach(key => {
      if (key.startsWith('_raw_')) {
        const originalKey = key.substring(5);
        try {
          finalizedDoc[originalKey] = JSON.parse(finalizedDoc[key]);
          delete finalizedDoc[key];
        } catch (err) {
          jsonError = `Error JSON en el campo "${originalKey}": ${err.message}`;
        }
      }
    });

    if (jsonError) {
      showStatus('error', jsonError);
      return;
    }

    // Block save if user is offline
    if (!navigator.onLine) {
      showStatus('error', 'Sin conexión. No se pueden subir cambios a la base de datos de producción.');
      return;
    }

    // Concurrency check to avoid overwrites
    if (!isNewDoc) {
      try {
        const res = await fetch(`/api/database/${selectedCollection}/${finalizedDoc._id}`);
        if (res.ok) {
          const serverDoc = await res.json();
          const cleanServerDoc = { ...serverDoc };
          delete cleanServerDoc._modelInfo;

          const isConflicted = JSON.stringify(cleanServerDoc) !== JSON.stringify(originalDocState);
          
          if (isConflicted) {
            setConflictModal({
              serverDoc: cleanServerDoc,
              userDoc: finalizedDoc
            });
            return;
          }
        }
      } catch (err) {
        console.error('Error conducting concurrency check:', err);
      }
    }

    setSecurityModal({
      isOpen: true,
      action: 'save',
      targetData: finalizedDoc,
      confirmedChecked: false,
      inputVerification: ''
    });
  };

  const triggerDeleteVerification = (doc) => {
    setSecurityModal({
      isOpen: true,
      action: 'delete',
      targetData: doc,
      confirmedChecked: false,
      inputVerification: ''
    });
  };

  // Perform verified action
  const executeVerifiedAction = async () => {
    const { action, targetData } = securityModal;
    
    setSecurityModal(prev => ({ ...prev, isOpen: false }));
    setLoading(true);

    try {
      if (action === 'save') {
        const id = targetData._id;
        if (isNewDoc) {
          // POST to create
          const res = await fetch(`/api/database/${selectedCollection}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetData)
          });
          if (!res.ok) throw new Error('Error al crear el documento');
          showStatus('success', 'Registro creado con éxito. Cambios subidos a GitHub.');
          clearDraft(selectedCollection, null);
        } else {
          // PUT to update
          const res = await fetch(`/api/database/${selectedCollection}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetData)
          });
          if (!res.ok) throw new Error('Error al actualizar el documento');
          showStatus('success', 'Registro actualizado con éxito. Cambios subidos a GitHub.');
          clearDraft(selectedCollection, id);
        }
        setEditingDoc(null);
      } else if (action === 'delete') {
        const id = targetData._id;
        const res = await fetch(`/api/database/${selectedCollection}/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Error al eliminar el documento');
        showStatus('success', 'Registro eliminado correctamente. Cambios subidos a GitHub.');
      }
      // Refresh documents
      await fetchDocuments(selectedCollection);
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="topbar glass-panel">
        <div className="bar-brand">
          <Database className="brand-icon neon-text" size={24} />
          <h1 className="brand-title">PLATUBOT <span className="rose-text">CONSOLE</span></h1>
        </div>

        <div className="network-status-wrapper">
          {isOnline ? (
            <span className="network-badge online">
              <span className="pulse-dot"></span> EN LÍNEA
            </span>
          ) : (
            <span className="network-badge offline">
              <span className="pulse-dot"></span> SIN CONEXIÓN
            </span>
          )}
        </div>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.displayName}</span>
            <span className="user-role">Administrador</span>
          </div>
          {user.avatar ? (
            <img 
              className="user-avatar" 
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
              alt={user.username}
            />
          ) : (
            <div className="user-avatar-fallback"><User size={18} /></div>
          )}
          <a href="/api/auth/logout" className="logout-btn" title="Cerrar Sesión">
            <LogOut size={18} />
          </a>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="layout-body">
        {/* Sidebar Collection List */}
        <aside className="sidebar glass-panel">
          <h3 className="section-title uppercase-title">Colecciones</h3>
          <nav className="collection-nav">
            {collections.map(colName => (
              <button
                key={colName}
                onClick={() => { setSelectedCollection(colName); setEditingDoc(null); }}
                className={`collection-item ${selectedCollection === colName ? 'active' : ''}`}
              >
                <Database size={16} />
                <span>{colName}</span>
              </button>
            ))}
            {collections.length === 0 && (
              <span className="nav-empty">No hay colecciones</span>
            )}
          </nav>
        </aside>

        {/* Database records viewer */}
        <main className="main-content">
          {/* Action Alerts */}
          {statusMessage && (
            <div className={`toast-alert animate-fade-in ${statusMessage.type}`}>
              {statusMessage.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* If not currently editing a document, show the Table list */}
          {!editingDoc ? (
            <div className="card glass-panel flex-column h-100">
              <div className="card-header">
                <div>
                  <h2 className="collection-title neon-text uppercase-title">{selectedCollection}</h2>
                  <span className="count-label">{filteredDocuments.length} registros cargados</span>
                </div>
                <div className="header-actions">
                  <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar en registros..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={handleOpenCreate} className="btn primary-btn btn-icon">
                    <Plus size={18} /> Nuevo Registro
                  </button>
                </div>
              </div>

              {/* Table Body */}
              <div className="table-responsive">
                {loading ? (
                  <div className="center-loader">
                    <RefreshCw className="spinner text-rose" size={32} />
                    <p>Consultando base de datos...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="center-empty">
                    <Database size={48} className="empty-icon" />
                    <p>No se encontraron registros en esta colección.</p>
                  </div>
                ) : (
                  <table className="crud-table">
                    <thead>
                      <tr>
                        <th>_id</th>
                        {Object.keys(filteredDocuments[0] || {})
                          .filter(k => k !== '_id' && k !== '_modelInfo')
                          .slice(0, 4) // Show up to 4 preview columns
                          .map(key => (
                            <th key={key}>{key}</th>
                          ))
                        }
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc, idx) => (
                        <tr key={doc._id || idx}>
                          <td className="code-font font-bold text-rose">{doc._id || 'Auto-Generado'}</td>
                          {Object.entries(doc)
                            .filter(([k]) => k !== '_id' && k !== '_modelInfo')
                            .slice(0, 4)
                            .map(([key, val]) => (
                              <td key={key} className="preview-td">
                                {typeof val === 'object' && val !== null ? (
                                  <div className="table-json-preview">
                                    <JsonHighlighter data={val} />
                                  </div>
                                ) : (
                                  val === null ? <span className="empty-cell">Nulo</span> : (String(val) || <span className="empty-cell">Vacío</span>)
                                )}
                              </td>
                            ))
                          }
                          <td className="actions-cell">
                            <button onClick={() => handleOpenEdit(doc)} className="action-btn edit-btn" title="Editar">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => triggerDeleteVerification(doc)} className="action-btn delete-btn" title="Borrar">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* Document Editor Panel */
            <div className="card glass-panel animate-fade-in">
              <div className="card-header">
                <div>
                  <h2 className="collection-title uppercase-title">
                    {isNewDoc ? 'Nuevo Registro' : 'Editar Registro'}
                  </h2>
                  <span className="count-label">Colección: {selectedCollection}</span>
                </div>
                <button 
                  onClick={() => {
                    const docId = editingDoc._id || 'new';
                    clearDraft(selectedCollection, docId);
                    setEditingDoc(null);
                    setDraftDetected(null);
                  }} 
                  className="btn text-btn"
                >
                  <X size={18} /> Cancelar
                </button>
              </div>

              {draftDetected && (
                <div className="draft-detected-banner">
                  <div className="draft-banner-text">
                    <AlertTriangle size={18} />
                    <span>Se detectó un borrador local no guardado para este registro. ¿Deseas recuperarlo?</span>
                  </div>
                  <div className="draft-banner-actions">
                    <button
                      type="button"
                      className="btn primary-btn draft-btn recover"
                      onClick={() => {
                        setEditingDoc(draftDetected.doc);
                        setDraftDetected(null);
                        showStatus('success', 'Borrador local restaurado con éxito.');
                      }}
                    >
                      Recuperar Borrador
                    </button>
                    <button
                      type="button"
                      className="btn sec-btn draft-btn"
                      onClick={() => {
                        const docId = editingDoc._id || 'new';
                        clearDraft(selectedCollection, docId);
                        setDraftDetected(null);
                        showStatus('success', 'Borrador local descartado.');
                      }}
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={triggerSaveVerification} className="editor-form">
                <div className="form-grid">
                  {/* ID Field */}
                  <div className="form-group span-2 form-field-card id-field-card animate-fade-in">
                    <div className="field-label-container">
                      <FileText size={14} className="file-icon text-rose" />
                      <label className="input-label">_id (Identificador Único)</label>
                    </div>
                    <input 
                      type="text" 
                      value={editingDoc._id}
                      onChange={e => handleFieldChange('_id', e.target.value)}
                      placeholder="Dejar vacío para auto-generación de UUID"
                      className="form-input code-font"
                      disabled={!isNewDoc} // IDs cannot be modified once created
                    />
                  </div>

                  {/* Rest of the Schema Fields */}
                  {Object.entries(editingDoc)
                    .filter(([key]) => key !== '_id' && !key.startsWith('_raw_'))
                    .map(([key, val]) => {
                      const isComplex = val !== null && typeof val === 'object';
                      const rawKey = `_raw_${key}`;

                      if (isComplex) {
                        const mode = editorModes[key] || 'visual';
                        const setMode = (newMode) => {
                          setEditorModes(prev => ({ ...prev, [key]: newMode }));
                          if (newMode === 'raw' && editingDoc[rawKey] === undefined) {
                            setEditingDoc(prev => ({
                              ...prev,
                              [rawKey]: JSON.stringify(val, null, 2)
                            }));
                          }
                        };

                        return (
                          <div key={key} className="complex-field-container">
                            <div className="complex-field-header">
                              <label className="input-label">{key} (Estructura de Datos)</label>
                              <div className="editor-mode-selector">
                                <button
                                  type="button"
                                  className={`mode-tab-btn ${mode === 'visual' ? 'active' : ''}`}
                                  onClick={() => setMode('visual')}
                                >
                                  Visual
                                </button>
                                <button
                                  type="button"
                                  className={`mode-tab-btn ${mode === 'raw' ? 'active' : ''}`}
                                  onClick={() => setMode('raw')}
                                >
                                  JSON Crudo
                                </button>
                              </div>
                            </div>

                            {mode === 'visual' ? (
                              <div className="visual-editor-container">
                                <NestedObjectEditor
                                  path={[]}
                                  value={val}
                                  onChange={(path, newValue) => handleNestedFieldChange(key, path, newValue)}
                                />
                              </div>
                            ) : (
                              <div className="raw-editor-container">
                                <div className="form-group flex-column">
                                  <textarea
                                    rows={8}
                                    value={editingDoc[rawKey] !== undefined ? editingDoc[rawKey] : JSON.stringify(val, null, 2)}
                                    onChange={e => handleComplexFieldChange(key, e.target.value)}
                                    placeholder="{}"
                                    className="form-textarea code-font vscode-textarea"
                                  />
                                  <span className="field-hint">Debe ser código JSON sintácticamente válido.</span>
                                </div>
                                <div className="vscode-preview-box">
                                  <div className="preview-header">Vista Previa Formateada (VS Code)</div>
                                  <JsonHighlighter data={editingDoc[rawKey] !== undefined ? editingDoc[rawKey] : val} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="form-group form-field-card animate-fade-in">
                          <div className="field-label-container">
                            <FileText size={14} className="file-icon text-muted" />
                            <label className="input-label">{key}</label>
                          </div>
                          <input 
                            type="text" 
                            value={val}
                            onChange={e => handleFieldChange(key, e.target.value)}
                            className="form-input"
                          />
                        </div>
                      );
                    })
                  }
                </div>

                <div className="form-footer">
                  <button type="button" onClick={() => setEditingDoc(null)} className="btn sec-btn">
                    Cancelar
                  </button>
                  <button type="submit" className="btn primary-btn btn-icon">
                    <Save size={18} /> Guardar Registro
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* DOUBLE SECURITY VERIFICATION MODAL */}
      {securityModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <AlertTriangle className="warn-icon neon-text" size={32} />
              <h2 className="modal-title uppercase-title text-rose">Doble Confirmación de Seguridad</h2>
            </div>
            
            <div className="modal-body">
              <p className="warn-text">
                Estás a punto de {securityModal.action === 'save' ? 'GUARDAR/EDITAR' : 'ELIMINAR'} un registro en la colección <span className="bold-neon">"{selectedCollection}"</span>.
              </p>
              <p className="warn-desc">
                Esta acción modificará directamente la base de datos en ejecución del bot e iniciará un backup automático con push directo a GitHub en origin/main.
              </p>

              {/* SECURITY STEP 1: Confirmation Checkbox */}
              <div className="security-step border-bottom">
                <label className="sec-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={securityModal.confirmedChecked}
                    onChange={e => setSecurityModal(prev => ({ ...prev, confirmedChecked: e.target.checked }))}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Confirmar: Entiendo los riesgos y deseo realizar esta operación.</span>
                </label>
              </div>

              {/* SECURITY STEP 2: Write Verification word */}
              <div className="security-step">
                <label className="input-label">Para continuar, escribe <span className="highlight-code">"{selectedCollection}"</span> a continuación:</label>
                <input 
                  type="text"
                  placeholder="Escribir aquí..."
                  value={securityModal.inputVerification}
                  onChange={e => setSecurityModal(prev => ({ ...prev, inputVerification: e.target.value }))}
                  className="form-input text-center font-bold"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))} 
                className="btn sec-btn"
              >
                Abortar Operación
              </button>
              <button 
                type="button" 
                onClick={executeVerifiedAction}
                disabled={!securityModal.confirmedChecked || securityModal.inputVerification !== selectedCollection}
                className="btn danger-glow-btn"
              >
                EJECUTAR CAMBIO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX */}
      <style jsx global>{`
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #000000;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
          margin-bottom: 24px;
        }

        .bar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          animation: pulse 2s infinite;
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 3px;
        }

        .rose-text {
          color: var(--rose-neon);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--panel-border-glow);
        }

        .user-avatar-fallback {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #202020;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border: 1px solid var(--panel-border);
        }

        .logout-btn {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          transition: var(--transition-smooth);
          text-decoration: none;
        }

        .logout-btn:hover {
          color: #ffffff;
          background: rgba(255, 42, 95, 0.15);
          border-color: rgba(255, 42, 95, 0.3);
        }

        /* Layout */
        .layout-body {
          display: flex;
          flex: 1;
          gap: 24px;
          padding: 0 24px 24px;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }

        .sidebar {
          width: 260px;
          padding: 24px 16px;
          flex-shrink: 0;
          height: fit-content;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0; /* Prevents flex overflow */
        }

        .uppercase-title {
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .section-title {
          font-size: 0.8rem;
          color: var(--rose-neon);
          margin-bottom: 16px;
          padding-left: 8px;
        }

        .collection-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .collection-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .collection-item:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .collection-item.active {
          color: #ffffff;
          background: var(--rose-dim);
          border-color: var(--panel-border-glow);
          box-shadow: 0 0 10px rgba(255, 42, 95, 0.05);
        }

        .nav-empty {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding-left: 8px;
        }

        /* Card Styles */
        .card {
          padding: 28px;
          border-radius: 12px;
        }

        .h-100 {
          height: 100%;
        }

        .flex-column {
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .collection-title {
          font-size: 1.5rem;
          font-weight: 800;
        }

        .count-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 4px;
          display: block;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-box {
          position: relative;
          width: 240px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-box input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          background: #080808;
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.85rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .search-box input:focus {
          border-color: var(--rose-neon);
          box-shadow: 0 0 10px rgba(255, 42, 95, 0.15);
        }

        /* Table */
        .table-responsive {
          flex: 1;
          overflow-y: auto;
          min-height: 350px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
        }

        .crud-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .crud-table th {
          padding: 16px 20px;
          background: #080808;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .crud-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle !important;
        }

        .crud-table tr:hover td {
          background: rgba(255, 42, 95, 0.02);
        }

        .preview-td {
          color: var(--text-secondary);
        }

        .font-bold {
          font-weight: 600;
        }

        .text-rose {
          color: var(--rose-neon);
        }

        .empty-cell {
          color: var(--text-muted);
          font-style: italic;
        }

        .object-badge {
          display: inline-block;
          font-size: 0.75rem;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          border-radius: 4px;
        }

        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .text-right {
          text-align: right;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0c0c0c;
          border: 1px solid var(--panel-border);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .edit-btn {
          color: var(--text-secondary);
        }

        .edit-btn:hover {
          color: #ffffff;
          background: var(--rose-dim);
          border-color: var(--rose-neon);
        }

        .delete-btn {
          color: var(--text-muted);
        }

        .delete-btn:hover {
          color: #ffffff;
          background: rgba(255, 0, 0, 0.15);
          border-color: rgba(255, 0, 0, 0.3);
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
          letter-spacing: 0.5px;
          border: 1px solid transparent;
        }

        .btn-icon {
          gap: 8px;
        }

        .primary-btn {
          background: var(--rose-neon);
          color: #000000;
        }

        .primary-btn:hover {
          background: var(--rose-hover);
          box-shadow: var(--rose-glow);
          transform: translateY(-1px);
        }

        .sec-btn {
          background: #101010;
          border-color: var(--panel-border);
          color: var(--text-primary);
        }

        .sec-btn:hover {
          background: #181818;
          border-color: var(--panel-border-glow);
        }

        .text-btn {
          background: transparent;
          color: var(--text-secondary);
          gap: 6px;
        }

        .text-btn:hover {
          color: #ffffff;
        }

        /* Loaders and Empty screens */
        .center-loader, .center-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 350px;
          gap: 16px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .empty-icon {
          color: var(--text-muted);
          animation: pulse 2s infinite;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Forms */
        .editor-form {
          margin-top: 10px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .span-2 {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .form-input {
          padding: 12px;
          background: #080808;
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.9rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .form-input:focus, .form-textarea:focus {
          border-color: var(--rose-neon);
          box-shadow: 0 0 10px rgba(255, 42, 95, 0.15);
        }

        .form-input:disabled {
          background: #040404;
          border-color: rgba(255,255,255,0.02);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .form-textarea {
          padding: 14px;
          background: #080808;
          border: 1px solid var(--panel-border);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.85rem;
          outline: none;
          resize: vertical;
          transition: var(--transition-smooth);
          line-height: 1.5;
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
        }

        /* Toast Alert */
        .toast-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .toast-alert.success {
          background: rgba(0, 200, 100, 0.08);
          border: 1px solid rgba(0, 200, 100, 0.3);
          color: #38ef7d;
        }

        .toast-alert.error {
          background: rgba(255, 42, 95, 0.08);
          border: 1px solid rgba(255, 42, 95, 0.3);
          color: #ff5c81;
        }

        /* Modal Overlay for Double Verification */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .modal-content {
          width: 100%;
          max-width: 520px;
          padding: 36px;
          border-radius: 16px;
        }

        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          text-align: center;
        }

        .warn-icon {
          color: var(--rose-neon);
          animation: pulse 1.5s infinite;
        }

        .modal-title {
          font-size: 1.3rem;
          font-weight: 800;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: center;
        }

        .warn-text {
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .bold-neon {
          color: var(--rose-neon);
          font-weight: 800;
          text-shadow: var(--rose-glow);
        }

        .warn-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .security-step {
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .border-bottom {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sec-checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-align: left;
        }

        .checkbox-input {
          accent-color: var(--rose-neon);
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .checkbox-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.3;
        }

        .highlight-code {
          background: rgba(255, 42, 95, 0.15);
          border: 1px dashed var(--rose-neon);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: bold;
        }

        .modal-footer {
          margin-top: 28px;
          display: flex;
          gap: 16px;
        }

        .modal-footer .btn {
          flex: 1;
        }

        .danger-glow-btn {
          background: var(--rose-neon);
          color: #000000;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .danger-glow-btn:hover:not(:disabled) {
          background: var(--rose-hover);
          box-shadow: var(--rose-glow), 0 0 30px rgba(255, 42, 95, 0.5);
          transform: translateY(-1px);
        }

        .danger-glow-btn:disabled {
          background: #181818;
          color: var(--text-muted);
          border-color: transparent;
          cursor: not-allowed;
        }

        .text-center {
          text-align: center;
        }

        /* Animations keyframes */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* VS Code and Premium JSON Highlighting Styles */
        .vscode-editor-pre {
          background: #1e1e1e !important;
          color: #d4d4d4 !important;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #3c3c3c;
          overflow: auto;
          max-height: 300px;
          margin: 0;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.85rem;
          line-height: 1.5;
          text-align: left;
        }

        .vscode-editor-pre code {
          font-family: 'JetBrains Mono', monospace !important;
        }

        .json-key {
          color: #9cdcfe !important; /* Light blue */
          font-weight: 500;
        }

        .json-string {
          color: #ce9178 !important; /* Orange-brown */
        }

        .json-number {
          color: #b5cea8 !important; /* Light green */
        }

        .json-boolean {
          color: #569cd6 !important; /* Blue */
        }

        .json-null {
          color: #569cd6 !important; /* Blue */
        }

        .table-json-preview {
          max-height: 80px;
          max-width: 250px;
          overflow: auto;
          font-family: 'JetBrains Mono', monospace !important;
          border-radius: 4px;
          background: #0f0f0f;
          border: 1px solid rgba(255, 42, 95, 0.08);
          box-shadow: inset 0 0 6px rgba(0,0,0,0.8);
          white-space: normal !important; /* Override parent nowrap */
        }

        .table-json-preview .vscode-editor-pre {
          background: transparent !important;
          border: none;
          padding: 6px 10px;
          font-size: 0.75rem;
          max-height: 70px;
          white-space: pre !important; /* Ensure multi-line pre formatting */
        }

        /* Complex Field Container and Modes */
        .complex-field-container {
          grid-column: span 2;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 8px;
        }

        .complex-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .editor-mode-selector {
          display: flex;
          background: #141414;
          padding: 3px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mode-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .mode-tab-btn:hover {
          color: #ffffff;
        }

        .mode-tab-btn.active {
          background: var(--rose-dim);
          color: var(--rose-neon);
          border: 1px solid rgba(255, 42, 95, 0.2);
        }

        /* Visual Form Editor Styles */
        .visual-editor-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .nested-object-box {
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-left: 3px solid var(--rose-neon);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.15);
          margin-bottom: 12px;
          width: 100%;
          text-align: left;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .nested-object-box:hover {
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .nested-object-box.level-0 {
          border-left-color: var(--rose-neon);
          background: rgba(255, 42, 95, 0.01);
        }
        
        .nested-object-box.level-1 {
          border-left-color: #38bdf8; /* sky blue */
          background: rgba(56, 189, 248, 0.01);
        }

        .nested-object-box.level-2 {
          border-left-color: #a855f7; /* purple */
          background: rgba(168, 85, 247, 0.01);
        }

        .nested-object-header {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          transition: var(--transition-smooth);
        }

        .nested-object-header:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .folder-chevron {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .folder-icon-main {
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .folder-icon-main.folder-open {
          color: var(--rose-neon);
        }

        .level-1 .folder-icon-main.folder-open {
          color: #38bdf8;
        }

        .level-2 .folder-icon-main.folder-open {
          color: #a855f7;
        }

        .nested-object-title {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .folder-type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .nested-object-body {
          padding: 16px 16px 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        /* Connecting vertical lines matching level colors */
        .nested-object-body::before {
          content: '';
          position: absolute;
          left: 12px;
          top: 0;
          bottom: 16px;
          width: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .nested-object-box.level-0 > .nested-object-body::before {
          background: rgba(255, 42, 95, 0.12);
        }

        .nested-object-box.level-1 > .nested-object-body::before {
          background: rgba(56, 189, 248, 0.12);
        }

        .nested-object-box.level-2 > .nested-object-body::before {
          background: rgba(168, 85, 247, 0.12);
        }

        .nested-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-size: 0.85rem;
          width: 100%;
        }

        .nested-field-row.checkbox-row {
          padding: 2px 0;
        }

        .field-label-container {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 140px;
          color: var(--text-secondary);
        }

        .file-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .nested-field-label {
          font-weight: 500;
          color: var(--text-secondary);
          text-align: left;
        }

        .field-input-wrapper {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .nested-input {
          width: 100% !important;
          padding: 8px 12px !important;
          font-size: 0.85rem !important;
          background: #090909 !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
        }

        .nested-input:focus {
          border-color: var(--rose-neon) !important;
          background: #0e0e0e !important;
        }

        /* Premium Form Field & Primitive Cards */
        .editor-field-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 12px 16px;
          transition: var(--transition-smooth);
          width: 100%;
        }

        .editor-field-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        .primitive-card {
          border-left: 2px solid rgba(255, 255, 255, 0.15);
        }

        .primitive-card:hover {
          border-left-color: var(--rose-neon);
          box-shadow: 0 4px 20px rgba(255, 42, 95, 0.05);
        }

        .level-1 .primitive-card:hover {
          border-left-color: #38bdf8;
        }

        .level-2 .primitive-card:hover {
          border-left-color: #a855f7;
        }

        .form-field-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-left: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 14px 16px;
          transition: var(--transition-smooth);
        }

        .form-field-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
          border-left-color: var(--rose-neon);
          box-shadow: 0 4px 20px rgba(255, 42, 95, 0.05);
        }

        .id-field-card {
          border-left-color: var(--rose-neon);
        }

        /* Switch Toggle Premium Button */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 22px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: .3s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 22px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: #707070;
          transition: .3s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: rgba(255, 42, 95, 0.08);
          border-color: var(--rose-neon);
          box-shadow: 0 0 10px rgba(255, 42, 95, 0.15);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(20px);
          background-color: var(--rose-neon);
          box-shadow: 0 0 8px var(--rose-neon);
        }

        /* Raw Editor Split */
        .raw-editor-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .raw-editor-container {
            grid-template-columns: 1fr;
          }
        }

        .vscode-textarea {
          background: #1e1e1e !important;
          border-color: #3c3c3c !important;
          color: #d4d4d4 !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.85rem !important;
          text-align: left;
        }

        .vscode-textarea:focus {
          border-color: #007acc !important; /* VS Code blue focus */
          box-shadow: 0 0 10px rgba(0, 122, 204, 0.25) !important;
        }

        .vscode-preview-box {
          display: flex;
          flex-direction: column;
          border: 1px solid #3c3c3c;
          border-radius: 8px;
          background: #1e1e1e;
          overflow: hidden;
        }

        .preview-header {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 8px 12px;
          background: #252526;
          border-bottom: 1px solid #2d2d2d;
          color: var(--text-secondary);
          text-align: left;
        }

        /* Network Status Badge */
        .network-status-wrapper {
          display: flex;
          align-items: center;
          margin-right: 16px;
        }

        .network-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 6px 12px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .network-badge.online {
          background: rgba(46, 213, 115, 0.08);
          color: #2ed573;
          border: 1px solid rgba(46, 213, 115, 0.2);
          box-shadow: 0 0 10px rgba(46, 213, 115, 0.15);
        }

        .network-badge.offline {
          background: rgba(255, 71, 87, 0.08);
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.2);
          box-shadow: 0 0 10px rgba(255, 71, 87, 0.15);
          animation: pulse 2s infinite;
        }

        .network-badge .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .network-badge.online .pulse-dot {
          background: #2ed573;
          box-shadow: 0 0 8px #2ed573;
        }

        .network-badge.offline .pulse-dot {
          background: #ff4757;
          box-shadow: 0 0 8px #ff4757;
        }

        /* Draft Warning Banner */
        .draft-detected-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 165, 0, 0.08);
          border: 1px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
          padding: 14px 20px;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
          animation: fadeIn 0.4s ease;
          width: 100%;
        }

        .draft-banner-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #ffa500;
          font-weight: 500;
          text-align: left;
        }

        .draft-banner-actions {
          display: flex;
          gap: 12px;
        }

        .draft-btn {
          font-size: 0.75rem !important;
          padding: 6px 12px !important;
        }

        .draft-btn.recover {
          background: #ffa500 !important;
          color: #000000 !important;
          font-weight: 700;
        }

        .draft-btn.recover:hover {
          background: #ffb732 !important;
          box-shadow: 0 0 15px rgba(255, 165, 0, 0.35);
        }

        /* Array Box Visual Customization */
        .array-box {
          border-left-style: dashed !important;
        }

        .array-item-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 12px;
          border-radius: 8px;
          width: 100%;
        }

        .array-item-content {
          flex: 1;
          min-width: 0;
        }

        .array-item-delete-btn {
          background: rgba(255, 71, 87, 0.05);
          border: 1px solid rgba(255, 71, 87, 0.15);
          color: #ff4757;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .array-item-delete-btn:hover {
          background: #ff4757;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(255, 71, 87, 0.4);
        }

        .add-array-item-btn {
          align-self: flex-start;
          margin-top: 8px;
          border-style: dashed !important;
        }

        /* Conflict Modal Diff Boxes */
        .conflict-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 16px;
          text-align: left;
        }

        @media (max-width: 768px) {
          .conflict-grid {
            grid-template-columns: 1fr;
          }
        }

        .conflict-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .conflict-title {
          font-size: 0.8rem;
        }

        .field-input-wrapper .nested-input {
          width: 100% !important;
          flex: 1;
        }
      `}</style>

      {/* CONCURRENCY CONFLICT MODAL */}
      {conflictModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <AlertTriangle className="warn-icon neon-text" size={32} />
              <h2 className="modal-title uppercase-title text-rose">Conflicto de Edición Detectado</h2>
            </div>
            
            <div className="modal-body text-left">
              <p className="warn-text">
                ¡Atención! Otro administrador ha modificado este registro en la base de datos de producción mientras tú lo editabas localmente.
              </p>
              <p className="warn-desc">
                Para evitar corrupción de archivos y sobreescrituras accidentales, compara las diferencias a continuación:
              </p>

              <div className="conflict-grid">
                <div className="conflict-column">
                  <span className="conflict-title server">En el Servidor (Nuevos cambios)</span>
                  <JsonHighlighter data={conflictModal.serverDoc} />
                </div>
                <div className="conflict-column">
                  <span className="conflict-title user">Tus Cambios Locales (Borrador)</span>
                  <JsonHighlighter data={conflictModal.userDoc} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => {
                  setConflictModal(null);
                  setEditingDoc(null);
                  setDraftDetected(null);
                  showStatus('success', 'Operación cancelada. Se recargará el listado.');
                  fetchDocuments(selectedCollection);
                }} 
                className="btn sec-btn"
              >
                Descartar Mis Cambios y Recargar
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const targetDoc = conflictModal.userDoc;
                  setConflictModal(null);
                  setSecurityModal({
                    isOpen: true,
                    action: 'save',
                    targetData: targetDoc,
                    confirmedChecked: false,
                    inputVerification: ''
                  });
                }}
                className="btn danger-glow-btn"
              >
                Forzar Sobreescritura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
