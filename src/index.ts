export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeManagerOptions {
  mode?: ThemeMode
  storage?: Storage | false
  storageKey?: string
  systemQuery?: string
  el?: string | HTMLElement
  attribute?: string
  darkClass?: boolean
  callback?: (mode: ThemeMode) => void
}

export function createThemeManager(options: ThemeManagerOptions) {
  let _mode = options.mode ?? 'system'
  const _storage = options.storage === false ? false : options.storage ?? localStorage
  const _storageKey = options.storageKey ?? 'theme'
  const _systemQuery = options.systemQuery ?? '(prefers-color-scheme: dark)'
  const _attribute = options.attribute ?? 'data-theme'
  const _darkClass = options.darkClass !== false
  const _callback = options.callback ?? (() => {})
  const _el = typeof options.el === 'string'
    ? (document.querySelector(options.el) || document.documentElement)
    : (options.el || document.documentElement)

  const getSystemTheme = () => window.matchMedia(_systemQuery).matches ? 'dark' : 'light'

  const getTheme = () => {
    if (_mode === 'system') {
      return getSystemTheme()
    }
    return _mode
  }

  const setTheme = (mode: ThemeMode) => {
    let realMode = mode
    if (mode === 'system') {
      realMode = getSystemTheme()
    }
    if (['light', 'dark'].includes(realMode)) {
      _mode = mode // 这里保留原始 mode，便于外部 getTheme 判断
      if (_storage !== false) {
        _storage.setItem(_storageKey, mode)
      }
      _el.setAttribute(_attribute, realMode)
      if (_darkClass) {
        _el.classList.toggle('dark', realMode === 'dark')
      }
      _callback(realMode as ThemeMode)
    }
    else {
      throw new Error(`Invalid theme mode ${mode}, must be one of [light, dark, system]`)
    }
  }

  const toggleTheme = () => {
    if (_mode === 'system') {
      setTheme(getSystemTheme() === 'dark' ? 'light' : 'dark')
    }
    else {
      setTheme(_mode === 'light' ? 'dark' : 'light')
    }
  }

  const _init = () => {
    if (options.mode === 'light' || options.mode === 'dark') {
      _mode = options.mode
    }
    else if (_storage !== false) {
      const stored = _storage.getItem(_storageKey) ?? 'system'
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        _mode = stored as ThemeMode
      }
      else {
        _mode = 'system'
      }
    }
    else {
      _mode = 'system'
    }
    setTheme(_mode)
    window.matchMedia(_systemQuery).addEventListener('change', (_e) => {
      if (_storage !== false && (!_storage.getItem(_storageKey) || _storage.getItem(_storageKey) === 'system')) {
        setTheme('system')
      }
    })
  }

  _init()

  return {
    getTheme,
    setTheme,
    toggleTheme,
  }
}

// 只是为了方便使用的一个别名
export const create = createThemeManager
