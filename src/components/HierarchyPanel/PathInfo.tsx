import { useMemo } from 'react'
import { useDocumentStore } from '../../stores/documentStore'
import { computeTangentHull } from '../../geometry/path'
import { PathModeIcon, type PathMode } from '../icons/Icons'
import type { CircleShape } from '../../types'
import styles from './HierarchyPanel.module.css'

// Human-readable mode names for tooltip
const pathModeLabels: Record<PathMode, string> = {
  'tangent': 'Tangent only',
  'left-arc': 'Left arc',
  'right-arc': 'Right arc',
  'both-arcs': 'Both arcs',
  'closed': 'Closed loop'
}

export function PathInfo() {
  const shapes = useDocumentStore(state => state.shapes)
  const shapeOrder = useDocumentStore(state => state.shapeOrder)
  const closedPath = useDocumentStore(state => state.closedPath)
  const useStartPoint = useDocumentStore(state => state.useStartPoint)
  const useEndPoint = useDocumentStore(state => state.useEndPoint)
  const mirrorAxis = useDocumentStore(state => state.mirrorAxis)
  const cyclePathMode = useDocumentStore(state => state.cyclePathMode)
  
  // Derive current path mode from state
  const pathMode: PathMode = closedPath ? 'closed' 
    : (useStartPoint && useEndPoint) ? 'both-arcs'
    : useStartPoint ? 'left-arc'
    : useEndPoint ? 'right-arc'
    : 'tangent'
  
  const pathData = useMemo(() => {
    const circles = shapes.filter((s): s is CircleShape => s.type === 'circle')
    if (circles.length < 2) return null
    return computeTangentHull(circles, shapeOrder, 0, closedPath, useStartPoint, useEndPoint, mirrorAxis)
  }, [shapes, shapeOrder, closedPath, useStartPoint, useEndPoint, mirrorAxis])
  
  if (!pathData) {
    return (
      <div className={styles.pathInfo}>
        <div className={styles.pathInfoTitle}>PATH</div>
        <div className={styles.pathInfoContent}>
          Add at least 2 circles to create a path
        </div>
      </div>
    )
  }
  
  return (
    <div className={styles.pathInfo}>
      <div className={styles.pathInfoTitle}>PATH</div>
      <div className={styles.pathInfoContent}>
        <div className={styles.pathInfoRow}>
          <div className={styles.endModeGroup}>
            <button
              className={`${styles.endModeButton} ${pathMode !== 'tangent' ? styles.endModeActive : ''}`}
              onClick={cyclePathMode}
              title={`${pathModeLabels[pathMode]} (click to cycle)`}
            >
              <PathModeIcon size={16} mode={pathMode} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

