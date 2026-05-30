'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

// Helper to recursively update a value in a nested object
function setNestedValue(obj, path, value) {
  if (path.length === 0) return value;
  const isArray = Array.isArray(obj);
  const newObj = isArray ? [...obj] : { ...obj };
  const [head, ...tail] = path;
  newObj[head] = setNestedValue(obj[head], tail, value);
  return newObj;
}

export function useDatabase() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isNewDoc, setIsNewDoc] = useState(false);
  const [originalDocState, setOriginalDocState] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

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

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Fetch documents when collection changes
  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection);
    }
  }, [selectedCollection]);

  // Dismiss status message after 5s
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const showStatus = useCallback((type, text) => {
    setStatusMessage({ type, text });
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database');
      if (!res.ok) throw new Error('No se pudieron obtener las colecciones');
      const data = await res.json();
      setCollections(data.collections || []);
      if (data.collections?.length > 0 && !selectedCollection) {
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

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc =>
      Object.entries(doc).some(([key, val]) => {
        if (key === '_modelInfo') return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [documents, searchQuery]);

  const handleOpenEdit = useCallback((doc) => {
    const cleanDoc = { ...doc };
    delete cleanDoc._modelInfo;
    setOriginalDocState(JSON.parse(JSON.stringify(cleanDoc)));
    setEditingDoc(cleanDoc);
    setIsNewDoc(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    const scaffold = { _id: '' };
    if (documents.length > 0) {
      Object.keys(documents[0]).forEach(key => {
        if (key !== '_id' && key !== '_modelInfo') {
          scaffold[key] = typeof documents[0][key] === 'object'
            ? (Array.isArray(documents[0][key]) ? [] : {})
            : '';
        }
      });
    }
    setEditingDoc(scaffold);
    setIsNewDoc(true);
  }, [documents]);

  const handleFieldChange = useCallback((key, value) => {
    setEditingDoc(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleNestedFieldChange = useCallback((parentKey, path, newValue) => {
    setEditingDoc(prev => {
      const parentVal = prev[parentKey] || {};
      const updatedParentVal = setNestedValue(parentVal, path, newValue);
      return {
        ...prev,
        [parentKey]: updatedParentVal,
        [`_raw_${parentKey}`]: JSON.stringify(updatedParentVal, null, 2),
      };
    });
  }, []);

  const handleComplexFieldChange = useCallback((key, rawJsonString) => {
    setEditingDoc(prev => ({
      ...prev,
      [`_raw_${key}`]: rawJsonString,
    }));
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingDoc(null);
    setIsNewDoc(false);
    setOriginalDocState(null);
  }, []);

  const saveDocument = async (finalizedDoc) => {
    setLoading(true);
    try {
      if (isNewDoc) {
        const res = await fetch(`/api/database/${selectedCollection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalizedDoc),
        });
        if (!res.ok) throw new Error('Error al crear el documento');
        showStatus('success', 'Registro creado con éxito.');
      } else {
        const res = await fetch(`/api/database/${selectedCollection}/${finalizedDoc._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalizedDoc),
        });
        if (!res.ok) throw new Error('Error al actualizar el documento');
        showStatus('success', 'Registro actualizado con éxito.');
      }
      setEditingDoc(null);
      setIsNewDoc(false);
      await fetchDocuments(selectedCollection);
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (doc) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/database/${selectedCollection}/${doc._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar el documento');
      showStatus('success', 'Registro eliminado correctamente.');
      await fetchDocuments(selectedCollection);
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkConcurrency = async (finalizedDoc) => {
    if (isNewDoc) return null;
    try {
      const res = await fetch(`/api/database/${selectedCollection}/${finalizedDoc._id}`);
      if (res.ok) {
        const serverDoc = await res.json();
        const cleanServerDoc = { ...serverDoc };
        delete cleanServerDoc._modelInfo;
        const isConflicted = JSON.stringify(cleanServerDoc) !== JSON.stringify(originalDocState);
        if (isConflicted) {
          return { serverDoc: cleanServerDoc, userDoc: finalizedDoc };
        }
      }
    } catch (err) {
      console.error('Concurrency check failed:', err);
    }
    return null;
  };

  // Bulk replace across collection
  const bulkReplace = async (searchVal, replaceVal, options = {}) => {
    const { caseSensitive = false, useRegex = false } = options;
    const affectedDocs = [];

    for (const doc of documents) {
      const docString = JSON.stringify(doc);
      let flags = 'g';
      if (!caseSensitive) flags += 'i';

      let pattern;
      if (useRegex) {
        try {
          pattern = new RegExp(searchVal, flags);
        } catch {
          throw new Error('Expresión regular inválida');
        }
      } else {
        const escaped = searchVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(escaped, flags);
      }

      if (pattern.test(docString)) {
        const newDocString = docString.replace(pattern, replaceVal);
        const newDoc = JSON.parse(newDocString);
        affectedDocs.push({ original: doc, modified: newDoc });
      }
    }

    return affectedDocs;
  };

  const executeBulkReplace = async (affectedDocs) => {
    setLoading(true);
    let successCount = 0;
    try {
      for (const { modified } of affectedDocs) {
        const res = await fetch(`/api/database/${selectedCollection}/${modified._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modified),
        });
        if (res.ok) successCount++;
      }
      showStatus('success', `${successCount} de ${affectedDocs.length} documentos actualizados.`);
      await fetchDocuments(selectedCollection);
    } catch (err) {
      showStatus('error', `Error en reemplazo masivo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    collections,
    selectedCollection,
    documents,
    filteredDocuments,
    loading,
    searchQuery,
    statusMessage,
    editingDoc,
    isNewDoc,
    isOnline,
    originalDocState,
    // Actions
    setSelectedCollection,
    setSearchQuery,
    setEditingDoc,
    setStatusMessage,
    showStatus,
    handleOpenEdit,
    handleOpenCreate,
    handleFieldChange,
    handleNestedFieldChange,
    handleComplexFieldChange,
    cancelEditing,
    saveDocument,
    deleteDocument,
    checkConcurrency,
    fetchDocuments,
    bulkReplace,
    executeBulkReplace,
  };
}
