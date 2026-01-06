import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import { setupGlobalErrorHandlers } from './utils/globalErrorHandler'
import './theme.css'

// === STARTUP PROFILING ===
const startupTimes: Record<string, number> = {}
const startupStart = performance.now()

function markStartup(name: string) {
  startupTimes[name] = performance.now() - startupStart
  console.log(`%c[Startup] ${name}: ${startupTimes[name].toFixed(1)}ms`, 'color: #00ff88;')
}

// Monitor long tasks that block the main thread (>50ms)
try {
  const longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const duration = entry.duration
      const startTime = entry.startTime
      console.log(
        `%c[LONG TASK] ${duration.toFixed(0)}ms at ${startTime.toFixed(0)}ms`,
        'color: #ff0000; font-weight: bold; background: #ffeeee; padding: 2px 4px;'
      )
    }
  })
  longTaskObserver.observe({ type: 'longtask', buffered: true })
} catch (e) {
  console.log('[Startup] Long task observer not supported')
}

// Make available globally for component timing
try {
  window.__markStartup = markStartup
  window.__startupStart = startupStart
} catch {
  // Silently ignore if window is not available
}

// Check localStorage size (potential cause of slow hydration)
function getLocalStorageSize(): { total: number; items: Record<string, number> } {
  let total = 0
  const items: Record<string, number> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      if (value) {
        const size = (key.length + value.length) * 2 // UTF-16 = 2 bytes per char
        items[key] = size
        total += size
      }
    }
  }
  return { total, items }
}

const storageInfo = getLocalStorageSize()
console.log(`%c[Startup] localStorage size: ${(storageInfo.total / 1024).toFixed(1)}KB`, 'color: #ffd93d;')
Object.entries(storageInfo.items)
  .filter(([k]) => k.startsWith('serpentine'))
  .sort((a, b) => b[1] - a[1])
  .forEach(([key, size]) => {
    console.log(`  ${key}: ${(size / 1024).toFixed(1)}KB`)
  })

markStartup('imports complete')

// Set up global error handling
setupGlobalErrorHandlers()
markStartup('error handlers setup')

const root = createRoot(document.getElementById('root')!)
markStartup('root created')

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
markStartup('render called')

// Track when the main thread becomes idle
requestIdleCallback(() => {
  markStartup('idle callback (main thread free)')
})

// Track when first paint happens
requestAnimationFrame(() => {
  markStartup('first requestAnimationFrame')
  requestAnimationFrame(() => {
    markStartup('second requestAnimationFrame')
  })
})

