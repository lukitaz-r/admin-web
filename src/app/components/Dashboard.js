'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import DocumentList from './database/DocumentList';
import Toast from './ui/Toast';
import DraftBanner from './ui/DraftBanner';
import EditorToolbar from './database/editors/EditorToolbar';

// Editors
import AtlasEditor from './database/editors/AtlasEditor';
import TableEditor from './database/editors/TableEditor';
import TreeEditor from './database/editors/TreeEditor';
import JsonEditor from './database/editors/JsonEditor';

// Modals
import SecurityModal from './modals/SecurityModal';
import ConflictModal from './modals/ConflictModal';
import BulkReplaceModal from './modals/BulkReplaceModal';

// VPS
import LogViewer from './vps/LogViewer';
import BashPanel from './vps/BashPanel';

// Hooks
import { useDatabase } from '../hooks/useDatabase';
import { useVPS } from '../hooks/useVPS';
import { useDraft } from '../hooks/useDraft';

export default function Dashboard({ user }) {
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    documents,
    filteredDocuments,
    loading: dbLoading,
    searchQuery,
    setSearchQuery,
    statusMessage,
    editingDoc,
    setEditingDoc,
    isNewDoc,
    showStatus,
    handleOpenEdit,
    handleOpenCreate,
    handleFieldChange,
    handleNestedFieldChange,
    cancelEditing,
    saveDocument,
    deleteDocument,
    checkConcurrency,
    bulkReplace,
    executeBulkReplace
  } = useDatabase();

  const {
    logs,
    logsLoading,
    executeCommand,
    botStatus,
    statusLoading: vpsLoading,
    fetchLogs,
    fetchStatus
  } = useVPS();

  const {
    draftDetected,
    saveDraft,
    clearDraft,
    checkForDraft,
    dismissDraft,
    setDraftDetected
  } = useDraft(selectedCollection);

  const [activeSection, setActiveSection] = useState('collections'); // 'collections' | 'logs' | 'console'
  const [activeEditorMode, setActiveEditorMode] = useState('atlas'); // 'atlas' | 'table' | 'tree' | 'json'
  
  // Modals visibility
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [securityModal, setSecurityModal] = useState({
    isOpen: false,
    action: null,
    targetData: null,
    confirmedChecked: false,
    inputVerification: ''
  });
  const [conflictModal, setConflictModal] = useState(null);

  // Poll VPS status on mount
  useEffect(() => {
    fetchStatus();
    const timer = setInterval(() => fetchStatus(), 15000);
    return () => clearInterval(timer);
  }, []);

  // Poll logs on logs section activation
  useEffect(() => {
    if (activeSection === 'logs') {
      fetchLogs();
    }
  }, [activeSection]);

  // Handle draft loading
  const handleLoadDraft = () => {
    if (draftDetected) {
      setEditingDoc(draftDetected.doc);
      dismissDraft();
      showStatus('success', 'Borrador local cargado.');
    }
  };

  const handleDiscardDraft = () => {
    if (draftDetected) {
      clearDraft(draftDetected.doc._id);
      dismissDraft();
      showStatus('success', 'Borrador local descartado.');
    }
  };

  // Trigger Save Validation
  const handleSaveDocPress = async () => {
    if (!editingDoc) return;
    
    // Concurrency check
    const conflict = await checkConcurrency(editingDoc);
    if (conflict) {
      setConflictModal(conflict);
      return;
    }

    setSecurityModal({
      isOpen: true,
      action: 'save',
      targetData: editingDoc,
      confirmedChecked: false,
      inputVerification: ''
    });
  };

  // Trigger Delete Validation
  const handleDeleteDocPress = (doc) => {
    setSecurityModal({
      isOpen: true,
      action: 'delete',
      targetData: doc,
      confirmedChecked: false,
      inputVerification: ''
    });
  };

  const executeSecurityAction = async () => {
    const { action, targetData } = securityModal;
    setSecurityModal(prev => ({ ...prev, isOpen: false }));

    if (action === 'save') {
      await saveDocument(targetData);
      clearDraft(targetData._id);
    } else if (action === 'delete') {
      await deleteDocument(targetData);
    }
  };

  // Force overwrite on edit conflict
  const handleForceOverwrite = (doc) => {
    setConflictModal(null);
    setSecurityModal({
      isOpen: true,
      action: 'save',
      targetData: doc,
      confirmedChecked: false,
      inputVerification: ''
    });
  };

  // Execute bulk replacement
  const handleBulkReplaceApply = async (field, searchVal, replaceVal) => {
    try {
      const affected = await bulkReplace(searchVal, replaceVal);
      if (affected.length === 0) {
        showStatus('error', 'No se encontraron documentos para actualizar.');
        return;
      }
      await executeBulkReplace(affected);
    } catch (err) {
      showStatus('error', err.message);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <DashboardLayout
      user={user}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      collections={collections}
      selectedCollection={selectedCollection}
      setSelectedCollection={setSelectedCollection}
      vpsStatus={botStatus}
      vpsLoading={vpsLoading}
      onLogout={handleLogout}
      onAddNewDocument={handleOpenCreate}
    >
      {/* Toast Alert popup */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast message={statusMessage} onDismiss={() => showStatus(null)} />
        </div>
      )}

      {/* Main Sections */}
      {activeSection === 'collections' && (
        <div className="flex flex-col gap-6 w-full h-full">
          {editingDoc ? (
            /* Editing Document View */
            <div className="flex flex-col gap-6 w-full animate-[fadeIn_0.2s_var(--ease-smooth)]">
              <EditorToolbar
                documentId={editingDoc._id}
                collectionName={selectedCollection}
                activeMode={activeEditorMode}
                setActiveMode={setActiveEditorMode}
                isNewDoc={isNewDoc}
                onSave={handleSaveDocPress}
                onCancel={cancelEditing}
                hasDraft={!!draftDetected}
              />

              {/* Draft Banner if detected */}
              <DraftBanner
                draftDetected={draftDetected}
                onLoad={handleLoadDraft}
                onDiscard={handleDiscardDraft}
              />

              {/* Dynamic Editor Mode switch */}
              <div className="p-6 rounded-2xl border border-border bg-glass">
                {activeEditorMode === 'atlas' && (
                  <AtlasEditor
                    editingDoc={editingDoc}
                    isNewDoc={isNewDoc}
                    onFieldChange={(key, val) => {
                      handleFieldChange(key, val);
                      saveDraft({ ...editingDoc, [key]: val });
                    }}
                    onNestedFieldChange={(parentKey, path, val) => {
                      handleNestedFieldChange(parentKey, path, val);
                      saveDraft({ ...editingDoc }); // Save with parent reference updated
                    }}
                  />
                )}

                {activeEditorMode === 'table' && (
                  <TableEditor
                    editingDoc={editingDoc}
                    onFieldChange={(key, val) => {
                      handleFieldChange(key, val);
                      saveDraft({ ...editingDoc, [key]: val });
                    }}
                  />
                )}

                {activeEditorMode === 'tree' && (
                  <TreeEditor
                    editingDoc={editingDoc}
                    isNewDoc={isNewDoc}
                    onFieldChange={(key, val) => {
                      handleFieldChange(key, val);
                      saveDraft({ ...editingDoc, [key]: val });
                    }}
                    onNestedFieldChange={(parentKey, path, val) => {
                      handleNestedFieldChange(parentKey, path, val);
                      saveDraft({ ...editingDoc });
                    }}
                  />
                )}

                {activeEditorMode === 'json' && (
                  <JsonEditor
                    editingDoc={editingDoc}
                    onFieldChange={(key, val) => {
                      handleFieldChange(key, val);
                      saveDraft({ ...editingDoc, [key]: val });
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Document List View */
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-end -mb-4">
                <button
                  onClick={() => setIsBulkOpen(true)}
                  className="text-xs text-warning hover:text-warning/80 font-bold border border-warning/15 hover:border-warning/30 bg-warning/5 hover:bg-warning/10 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                >
                  Reemplazo Masivo en Colección
                </button>
              </div>

              <DocumentList
                collectionName={selectedCollection}
                documents={filteredDocuments}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectDoc={(doc) => {
                  handleOpenEdit(doc);
                  checkForDraft(doc);
                }}
                onDeleteDoc={handleDeleteDocPress}
                onAddNewDocument={handleOpenCreate}
              />
            </div>
          )}
        </div>
      )}

      {activeSection === 'logs' && (
        <div className="w-full">
          <LogViewer
            logs={logs}
            loading={logsLoading}
            onFetch={fetchLogs}
          />
        </div>
      )}

      {activeSection === 'console' && (
        <div className="w-full">
          <BashPanel
            onExec={executeCommand}
            loading={false}
          />
        </div>
      )}

      {/* DOUBLE CONFIRMATION SECURITY MODAL */}
      <SecurityModal
        isOpen={securityModal.isOpen}
        action={securityModal.action}
        confirmedChecked={securityModal.confirmedChecked}
        setConfirmedChecked={(val) => setSecurityModal(prev => ({ ...prev, confirmedChecked: val }))}
        inputVerification={securityModal.inputVerification}
        setInputVerification={(val) => setSecurityModal(prev => ({ ...prev, inputVerification: val }))}
        onClose={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeSecurityAction}
      />

      {/* CONCURRENCY CONFLICT MODAL */}
      <ConflictModal
        conflictData={conflictModal}
        onClose={() => setConflictModal(null)}
        onDiscard={() => {
          setConflictModal(null);
          cancelEditing();
        }}
        onForceOverwrite={handleForceOverwrite}
      />

      {/* BULK REPLACE MODAL */}
      <BulkReplaceModal
        isOpen={isBulkOpen}
        documents={documents}
        onClose={() => setIsBulkOpen(false)}
        onConfirm={handleBulkReplaceApply}
      />
    </DashboardLayout>
  );
}
