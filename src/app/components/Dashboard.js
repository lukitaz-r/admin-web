'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LogOut, Database, Search, Plus, Edit, Trash2, 
  Save, X, RefreshCw, AlertTriangle, Check, User 
} from 'lucide-react/dist/cjs/lucide-react';

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
  const handleOpenEdit = (doc) => {
    // Clone doc without private attributes
    const cleanDoc = { ...doc };
    delete cleanDoc._modelInfo;
    setEditingDoc(cleanDoc);
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
  const triggerSaveVerification = (e) => {
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
        } else {
          // PUT to update
          const res = await fetch(`/api/database/${selectedCollection}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetData)
          });
          if (!res.ok) throw new Error('Error al actualizar el documento');
          showStatus('success', 'Registro actualizado con éxito. Cambios subidos a GitHub.');
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
                                {typeof val === 'object' ? (
                                  <span className="object-badge">JSON Object</span>
                                ) : (
                                  String(val) || <span className="empty-cell">Nulo</span>
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
                <button onClick={() => setEditingDoc(null)} className="btn text-btn">
                  <X size={18} /> Cancelar
                </button>
              </div>

              <form onSubmit={triggerSaveVerification} className="editor-form">
                <div className="form-grid">
                  {/* ID Field */}
                  <div className="form-group span-2">
                    <label className="input-label">_id (Identificador Único)</label>
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
                      const isComplex = typeof val === 'object';
                      const rawKey = `_raw_${key}`;
                      const rawStringValue = editingDoc[rawKey] !== undefined 
                        ? editingDoc[rawKey] 
                        : (isComplex ? JSON.stringify(val, null, 2) : '');

                      if (isComplex) {
                        return (
                          <div key={key} className="form-group span-2">
                            <label className="input-label">{key} (Objeto JSON / Array)</label>
                            <textarea
                              rows={6}
                              value={rawStringValue}
                              onChange={e => handleComplexFieldChange(key, e.target.value)}
                              placeholder="{}"
                              className="form-textarea code-font"
                            />
                            <span className="field-hint">Debe ser código JSON sintácticamente válido.</span>
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="form-group">
                          <label className="input-label">{key}</label>
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
      <style jsx>{`
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
      `}</style>
    </div>
  );
}
