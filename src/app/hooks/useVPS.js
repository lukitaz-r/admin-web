'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_LOG_LINES } from '../lib/constants';

export function useVPS() {
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [logLines, setLogLines] = useState(DEFAULT_LOG_LINES);

  const [execOutput, setExecOutput] = useState(null);
  const [execLoading, setExecLoading] = useState(false);
  const [execHistory, setExecHistory] = useState([]);

  const [botStatus, setBotStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const intervalRef = useRef(null);

  const fetchLogs = useCallback(async (lines = logLines) => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetch(`/api/vps/logs?lines=${lines}`);
      if (!res.ok) throw new Error('No se pudieron obtener los logs');
      const data = await res.json();
      setLogs(data.logs || '');
    } catch (err) {
      setLogsError(err.message);
    } finally {
      setLogsLoading(false);
    }
  }, [logLines]);

  // Polling setup
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (pollInterval && pollInterval > 0) {
      intervalRef.current = setInterval(() => fetchLogs(), pollInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollInterval, fetchLogs]);

  const executeCommand = async (commandId) => {
    setExecLoading(true);
    setExecOutput(null);
    try {
      const res = await fetch('/api/vps/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandId }),
      });
      if (!res.ok) throw new Error('Error al ejecutar el comando');
      const data = await res.json();
      setExecOutput(data);

      // Add to history
      setExecHistory(prev => [
        { command: commandId, output: data, timestamp: Date.now() },
        ...prev.slice(0, 4),
      ]);

      return data;
    } catch (err) {
      const errorResult = { output: err.message, exitCode: 1, command: commandId };
      setExecOutput(errorResult);
      return errorResult;
    } finally {
      setExecLoading(false);
    }
  };

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/vps/status');
      if (!res.ok) throw new Error('No se pudo obtener el estado');
      const data = await res.json();
      setBotStatus(data);
    } catch (err) {
      setBotStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  return {
    // Logs
    logs,
    logsLoading,
    logsError,
    pollInterval,
    logLines,
    setPollInterval,
    setLogLines,
    fetchLogs,
    // Exec
    execOutput,
    execLoading,
    execHistory,
    executeCommand,
    // Status
    botStatus,
    statusLoading,
    fetchStatus,
  };
}
