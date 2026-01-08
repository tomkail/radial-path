import { useMemo, useState } from 'react'
import { useDocumentStore } from '../../stores/documentStore'
import { computeTangentHull } from '../../geometry/path'
import { pathSegmentsToSvgPath, calculatePathBounds } from '../../utils/fileIO'
import { MIN_CIRCLES } from '../../constants'
import type { CircleShape } from '../../types'
import styles from './HierarchyPanel.module.css'

export function SvgPreview() {
  const [showFill, setShowFill] = useState(false)
  
  const shapes = useDocumentStore(state => state.shapes)
  const shapeOrder = useDocumentStore(state => state.shapeOrder)
  const globalStretch = useDocumentStore(state => state.globalStretch)
  const closedPath = useDocumentStore(state => state.closedPath)
  const useStartPoint = useDocumentStore(state => state.useStartPoint)
  const useEndPoint = useDocumentStore(state => state.useEndPoint)
  const mirrorConfig = useDocumentStore(state => state.mirrorConfig)
  
  const svgData = useMemo(() => {
    const circles = shapes.filter((s): s is CircleShape => s.type === 'circle')
    if (circles.length < MIN_CIRCLES) return null
    
    const pathData = computeTangentHull(
      circles,
      shapeOrder,
      globalStretch,
      closedPath,
      useStartPoint,
      useEndPoint,
      mirrorConfig
    )
    
    if (pathData.segments.length === 0) return null
    
    const svgPathD = pathSegmentsToSvgPath(pathData.segments, closedPath)
    const bounds = calculatePathBounds(pathData.segments)
    
    // Add some padding
    const padding = 10
    const viewBoxX = bounds.minX - padding
    const viewBoxY = bounds.minY - padding
    const viewBoxWidth = bounds.maxX - bounds.minX + padding * 2
    const viewBoxHeight = bounds.maxY - bounds.minY + padding * 2
    
    return {
      pathD: svgPathD,
      viewBox: `${viewBoxX.toFixed(3)} ${viewBoxY.toFixed(3)} ${viewBoxWidth.toFixed(3)} ${viewBoxHeight.toFixed(3)}`,
      width: viewBoxWidth,
      height: viewBoxHeight
    }
  }, [shapes, shapeOrder, globalStretch, closedPath, useStartPoint, useEndPoint, mirrorConfig])
  
  if (!svgData) {
    return (
      <div className={styles.svgSection}>
        <div className={styles.svgHeaderRow}>
          <span className={styles.svgHeader}>SVG PREVIEW</span>
        </div>
        <div className={styles.svgEmpty}>
          Add at least 2 circles to preview SVG
        </div>
      </div>
    )
  }
  
  return (
    <div className={styles.svgSection}>
      <div className={styles.svgHeaderRow}>
        <span className={styles.svgHeader}>SVG PREVIEW</span>
        <label className={styles.svgFillToggle}>
          <input
            type="checkbox"
            checked={showFill}
            onChange={(e) => setShowFill(e.target.checked)}
          />
          <span>Fill</span>
        </label>
      </div>
      <div className={styles.svgContainer}>
        <svg 
          viewBox={svgData.viewBox}
          className={styles.svgPreview}
          preserveAspectRatio="xMidYMid meet"
        >
          <path 
            d={svgData.pathD}
            fill={showFill ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}



