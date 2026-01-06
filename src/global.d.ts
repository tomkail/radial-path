/// <reference types="vite/client" />

// CSS Module declarations
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Startup profiling globals
interface Window {
  __markStartup?: (name: string) => void
  __startupStart?: number
}
