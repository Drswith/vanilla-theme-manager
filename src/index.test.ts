import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createThemeManager } from './index'
import type { ThemeManagerOptions, ThemeMode } from './index'

// 模拟 localStorage
class FakeStorage implements Storage {
  private store: Record<string, string> = {}
  get length() { return Object.keys(this.store).length }
  getItem(key: string) { return this.store[key] ?? null }
  setItem(key: string, value: string) { this.store[key] = value }
  removeItem(key: string) { delete this.store[key] }
  clear() { this.store = {} }
  key(index: number) { return Object.keys(this.store)[index] ?? null }
}

describe('createThemeManager', () => {
  let el: HTMLElement
  let storage: FakeStorage
  let matchMediaMock: any
  let matchMediaDark = false

  beforeEach(() => {
    el = document.createElement('div')
    document.body.appendChild(el)
    storage = new FakeStorage()
    matchMediaDark = false
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: matchMediaDark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    window.matchMedia = matchMediaMock
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('默认初始化，mode 为 system，自动检测系统主题', () => {
    matchMediaDark = true
    const tm = createThemeManager({})
    expect(["light", "dark", "system"]).toContain(tm.getTheme())
  })

  it('传入 mode: dark，el: 自定义元素', () => {
    const tm = createThemeManager({ mode: 'dark', el, storage })
    expect(tm.getTheme()).toBe('dark')
    expect(el.getAttribute('data-theme')).toBe('dark')
    expect(el.classList.contains('dark')).toBe(true)
    expect(storage.getItem('theme')).toBe('dark')
  })

  it('setTheme 支持 light/dark/system', () => {
    const tm = createThemeManager({ el, storage })
    tm.setTheme('light')
    expect(el.getAttribute('data-theme')).toBe('light')
    tm.setTheme('dark')
    expect(el.getAttribute('data-theme')).toBe('dark')
    matchMediaDark = true
    tm.setTheme('system')
    expect(["light", "dark"]).toContain(el.getAttribute('data-theme'))
  })

  it('toggleTheme 切换', () => {
    const tm = createThemeManager({ el, storage, mode: 'light' })
    expect(el.getAttribute('data-theme')).toBe('light')
    tm.toggleTheme()
    expect(el.getAttribute('data-theme')).toBe('dark')
    tm.toggleTheme()
    expect(el.getAttribute('data-theme')).toBe('light')
  })

  it('storage 关闭时不会读写', () => {
    const tm = createThemeManager({ el, storage: false, mode: 'dark' })
    expect(el.getAttribute('data-theme')).toBe('dark')
  })

  it('callback 回调被调用', () => {
    const cb = vi.fn()
    createThemeManager({ el, storage, callback: cb, mode: 'dark' })
    expect(cb).toHaveBeenCalledWith('dark')
  })

  it('attribute/class 设置正确', () => {
    const tm = createThemeManager({ el, storage, attribute: 'theme-attr', darkClass: true, mode: 'dark' })
    expect(el.getAttribute('theme-attr')).toBe('dark')
    expect(el.classList.contains('dark')).toBe(true)
    tm.setTheme('light')
    expect(el.getAttribute('theme-attr')).toBe('light')
    expect(el.classList.contains('dark')).toBe(false)
  })
})
