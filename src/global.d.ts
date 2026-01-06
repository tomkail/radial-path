// CSS Module declarations
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

// Startup profiling globals
declare global {
  interface Window {
    __markStartup?: (name: string) => void
    __startupStart?: number
  }
}

export {}
