'use client';

import { useState, useEffect, useCallback } from 'react';

export function useDraft(selectedCollection) {
  const [draftDetected, setDraftDetected] = useState(null);

  const saveDraft = useCallback((doc) => {
    if (!doc || !selectedCollection) return;
    const docId = doc._id || 'new';
    const key = `platubot_draft_${selectedCollection}_${docId}`;
    localStorage.setItem(key, JSON.stringify(doc));
  }, [selectedCollection]);

  const loadDraft = useCallback((docId) => {
    const id = docId || 'new';
    const key = `platubot_draft_${selectedCollection}_${id}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }, [selectedCollection]);

  const clearDraft = useCallback((docId) => {
    const id = docId || 'new';
    const key = `platubot_draft_${selectedCollection}_${id}`;
    localStorage.removeItem(key);
  }, [selectedCollection]);

  const checkForDraft = useCallback((doc) => {
    const docId = doc._id || 'new';
    const saved = loadDraft(docId);
    if (saved) {
      setDraftDetected({ doc: saved, original: doc });
      return true;
    }
    setDraftDetected(null);
    return false;
  }, [loadDraft]);

  const dismissDraft = useCallback(() => {
    setDraftDetected(null);
  }, []);

  return {
    draftDetected,
    saveDraft,
    loadDraft,
    clearDraft,
    checkForDraft,
    dismissDraft,
    setDraftDetected,
  };
}
