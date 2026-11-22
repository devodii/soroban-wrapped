import * as React from 'react'

type Params = Record<string, string | null | undefined>

function read(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function setParams(patch: Params, replace = false) {
  const next = read()
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === '') next.delete(key)
    else next.set(key, value)
  }
  const query = next.toString()
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  if (replace) window.history.replaceState(null, '', url)
  else window.history.pushState(null, '', url)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

export function useParam(key: string): string | null {
  return React.useSyncExternalStore(subscribe, () => read().get(key))
}
