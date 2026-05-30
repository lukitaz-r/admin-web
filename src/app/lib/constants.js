// VPS command presets — these are the ONLY commands allowed to execute
export const VPS_COMMANDS = {
  restart: {
    id: 'restart',
    label: 'Reiniciar Bot',
    description: 'Reinicia todos los procesos del bot con pm2',
    icon: 'RotateCcw',
    requiresConfirmation: true,
    dangerLevel: 'warning',
  },
  status: {
    id: 'status',
    label: 'Estado del Servidor',
    description: 'Muestra uptime, memoria y CPU del servidor',
    icon: 'Activity',
    requiresConfirmation: false,
    dangerLevel: 'safe',
  },
  pull: {
    id: 'pull',
    label: 'Actualizar Código',
    description: 'Ejecuta git pull para traer los últimos cambios',
    icon: 'GitBranch',
    requiresConfirmation: true,
    dangerLevel: 'warning',
  },
};

// Log polling intervals (ms)
export const LOG_POLL_INTERVALS = {
  '5s': 5000,
  '10s': 10000,
  '30s': 30000,
  'manual': null,
};

// Default log lines to fetch
export const DEFAULT_LOG_LINES = 200;

// Editor mode options
export const EDITOR_MODES = {
  atlas: { id: 'atlas', label: 'Atlas', icon: 'LayoutList' },
  table: { id: 'table', label: 'Tabla', icon: 'Table' },
  tree: { id: 'tree', label: 'Árbol', icon: 'GitFork' },
  json: { id: 'json', label: 'JSON', icon: 'Code' },
};

// Sidebar sections
export const SIDEBAR_SECTIONS = {
  collections: { id: 'collections', label: 'Colecciones', icon: 'Database' },
  logs: { id: 'logs', label: 'Logs VPS', icon: 'ScrollText' },
  console: { id: 'console', label: 'Consola', icon: 'Terminal' },
};
