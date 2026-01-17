// IPC channel constants
export enum IPCChannels {
  // ==================== Plugin ====================

  // Plugin lifecycle
  PLUGIN_LOAD = 'plugin:load',
  PLUGIN_UNLOAD = 'plugin:unload',
  PLUGIN_RELOAD = 'plugin:reload',
  PLUGIN_LOAD_ALL = 'plugin:load-all',
  PLUGIN_UNLOAD_ALL = 'plugin:unload-all',

  // Plugin activation
  PLUGIN_ACTIVATE = 'plugin:activate',
  PLUGIN_DEACTIVATE = 'plugin:deactivate',

  // Plugin query
  PLUGIN_LIST = 'plugin:list',
  PLUGIN_GET = 'plugin:get',
  PLUGIN_GET_STATE = 'plugin:get-state',
  PLUGIN_GET_ALL_STATES = 'plugin:get-all-states',

  // Plugin management
  PLUGIN_INSTALL = 'plugin:install',
  PLUGIN_UNINSTALL = 'plugin:uninstall',
  PLUGIN_EXPORT = 'plugin:export',
  PLUGIN_IMPORT = 'plugin:import',
  PLUGIN_UPDATE = 'plugin:update',

  // Remote plugin
  PLUGIN_FETCH_REMOTE = 'plugin:fetch-remote',
  PLUGIN_CHECK_UPDATES = 'plugin:check-updates',

  // Plugin message
  PLUGIN_MESSAGE = 'plugin:message',

  // ==================== Window ====================

  // Window lifecycle
  WINDOW_SHOW = 'window:show',
  WINDOW_HIDE = 'window:hide',
  WINDOW_CLOSE = 'window:close',
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_MAXIMIZE = 'window:maximize',
  WINDOW_RESTORE = 'window:restore',
  WINDOW_IS_MAXIMIZED = 'window:is-maximized',
  WINDOW_START_DRAG = 'window:start-drag',

  // Plugin window
  PLUGIN_WINDOW_CREATE = 'plugin-window:create',
  PLUGIN_WINDOW_CLOSE = 'plugin-window:close',
  PLUGIN_WINDOW_GET_STATE = 'plugin-window:get-state',
  PLUGIN_WINDOW_SET_STATE = 'plugin-window:set-state',

  // Window events (main -> renderer)
  WINDOW_MAXIMIZED = 'window:maximized',
  WINDOW_UNMAXIMIZED = 'window:unmaximized',

  // ==================== Database ====================

  // Generic
  DB_QUERY = 'db:query',
  DB_EXECUTE = 'db:execute',

  // Clock settings
  DB_GET_CLOCK_SETTINGS = 'db:get-clock-settings',
  DB_UPDATE_CLOCK_SETTINGS = 'db:update-clock-settings',

  // Stats
  DB_GET_STATS = 'db:get-stats',
  DB_EXPORT_STATS = 'db:export-stats',
  DB_SAVE_KEYBOARD_STATS = 'db:save-keyboard-stats',
  DB_SAVE_MOUSE_CLICK_STATS = 'db:save-mouse-click-stats',
  DB_SAVE_MOUSE_MOVE_STATS = 'db:save-mouse-move-stats',

  // Plugin data
  DB_GET_PLUGIN_DATA = 'db:get-plugin-data',
  DB_GET_ALL_PLUGIN_DATA = 'db:get-all-plugin-data',
  DB_SAVE_PLUGIN_DATA = 'db:save-plugin-data',
  DB_DELETE_PLUGIN_DATA = 'db:delete-plugin-data',

  // Backup
  BACKUP_CREATE = 'backup:create',
  BACKUP_RESTORE = 'backup:restore',
  BACKUP_CREATE_SELECTIVE = 'backup:create-selective',
  BACKUP_RESTORE_SELECTIVE = 'backup:restore-selective',
  BACKUP_PREVIEW = 'backup:preview',

  // ==================== System ====================

  SYSTEM_NOTIFICATION = 'system:notification',
  SYSTEM_CLIPBOARD = 'system:clipboard',
  SYSTEM_GET_VERSION = 'system:get-version',

  // ==================== Input Monitor ====================

  INPUT_MONITOR_GET_STATS = 'input-monitor:get-stats',
  INPUT_MONITOR_RESET = 'input-monitor:reset',
  INPUT_MONITOR_SAVE = 'input-monitor:save',

  // ==================== Log ====================

  LOG_WRITE = 'log:write',
  LOG_GET_DIRECTORY = 'log:get-directory',
  LOG_SET_DIRECTORY = 'log:set-directory',
  LOG_READ_RECENT = 'log:read-recent',
  LOG_CLEAR = 'log:clear',
}

// Window event types (renderer -> main)
export enum WindowEvents {
  CLOSE = 'window:close',
  MINIMIZE = 'window:minimize',
  MAXIMIZE = 'window:maximize',
  RESTORE = 'window:restore',
}

// Plugin event types
export enum PluginEvents {
  LOADED = 'plugin:loaded',
  UNLOADED = 'plugin:unloaded',
  ACTIVATED = 'plugin:activated',
  DEACTIVATED = 'plugin:deactivated',
  ERROR = 'plugin:error',
  UPDATED = 'plugin:updated',
  INSTALLED = 'plugin:installed',
  UNINSTALLED = 'plugin:uninstalled',
}
