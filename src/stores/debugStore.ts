import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  enableProfiler, 
  disableProfiler, 
  printSummaryReport,
  clearProfilingData
} from '../utils/profiler'

export interface DebugState {
  // Visibility toggles
  showTangentPoints: boolean
  showTangentLabels: boolean
  showArcAngles: boolean
  showPathOrder: boolean
  showCircleCenters: boolean
  showGridCoords: boolean
  showArcDirection: boolean  // Show expected vs actual arc direction
  showMirrorPlaneNumbers: boolean  // Show plane indices and sector numbers for mirroring
  
  // Profiling
  profilingEnabled: boolean
  showPerformanceOverlay: boolean
  
  // Actions
  toggleTangentPoints: () => void
  toggleTangentLabels: () => void
  toggleArcAngles: () => void
  togglePathOrder: () => void
  toggleCircleCenters: () => void
  toggleGridCoords: () => void
  toggleArcDirection: () => void
  toggleMirrorPlaneNumbers: () => void
  resetDebug: () => void
  
  // Profiling actions
  toggleProfiling: () => void
  setProfilingEnabled: (enabled: boolean) => void
  togglePerformanceOverlay: () => void
  printProfilingReport: () => void
  clearProfilingData: () => void
}

export const useDebugStore = create<DebugState>()(
  persist(
    (set) => ({
      // All debug settings disabled by default
      showTangentPoints: false,
      showTangentLabels: false,
      showArcAngles: false,
      showPathOrder: false,
      showCircleCenters: false,
      showGridCoords: false,
      showArcDirection: false,
      showMirrorPlaneNumbers: false,
      
      // Profiling disabled by default
      profilingEnabled: false,
      showPerformanceOverlay: false,
      
      toggleTangentPoints: () => set((state) => ({ showTangentPoints: !state.showTangentPoints })),
      toggleTangentLabels: () => set((state) => ({ showTangentLabels: !state.showTangentLabels })),
      toggleArcAngles: () => set((state) => ({ showArcAngles: !state.showArcAngles })),
      togglePathOrder: () => set((state) => ({ showPathOrder: !state.showPathOrder })),
      toggleCircleCenters: () => set((state) => ({ showCircleCenters: !state.showCircleCenters })),
      toggleGridCoords: () => set((state) => ({ showGridCoords: !state.showGridCoords })),
      toggleArcDirection: () => set((state) => ({ showArcDirection: !state.showArcDirection })),
      toggleMirrorPlaneNumbers: () => set((state) => ({ showMirrorPlaneNumbers: !state.showMirrorPlaneNumbers })),
      resetDebug: () => {
        disableProfiler()
        clearProfilingData()
        set({
          showTangentPoints: false,
          showTangentLabels: false,
          showArcAngles: false,
          showPathOrder: false,
          showCircleCenters: false,
          showGridCoords: false,
          showArcDirection: false,
          showMirrorPlaneNumbers: false,
          profilingEnabled: false,
          showPerformanceOverlay: false,
        })
      },
      
      // Profiling actions
      toggleProfiling: () => set((state) => {
        const newEnabled = !state.profilingEnabled
        if (newEnabled) {
          enableProfiler()
        } else {
          disableProfiler()
        }
        return { profilingEnabled: newEnabled }
      }),
      
      setProfilingEnabled: (enabled: boolean) => {
        if (enabled) {
          enableProfiler()
        } else {
          disableProfiler()
        }
        set({ profilingEnabled: enabled })
      },
      
      togglePerformanceOverlay: () => set((state) => ({
        showPerformanceOverlay: !state.showPerformanceOverlay
      })),
      
      printProfilingReport: () => {
        printSummaryReport()
      },
      
      clearProfilingData: () => {
        clearProfilingData()
      },
    }),
    {
      name: 'serpentine-debug-settings',
      // Only persist the visibility toggles, not the actions
      partialize: (state) => ({
        showTangentPoints: state.showTangentPoints,
        showTangentLabels: state.showTangentLabels,
        showArcAngles: state.showArcAngles,
        showPathOrder: state.showPathOrder,
        showCircleCenters: state.showCircleCenters,
        showGridCoords: state.showGridCoords,
        showArcDirection: state.showArcDirection,
        showMirrorPlaneNumbers: state.showMirrorPlaneNumbers,
        // Don't persist profiling state - start fresh each session
      }),
      // Sync profiler state on rehydration
      onRehydrateStorage: () => (state) => {
        // Ensure profiler is disabled on page load (not persisted)
        if (state) {
          state.profilingEnabled = false
          state.showPerformanceOverlay = false
        }
      }
    }
  )
)

