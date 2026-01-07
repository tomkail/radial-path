/**
 * Icon exports using Lucide React icons + custom path icons
 * Canvas drawing functions are kept custom for Canvas 2D API rendering
 */

// Re-export Lucide icons with consistent naming
export {
  // Mirror icons
  FlipHorizontal2 as MirrorIcon,
  FlipHorizontal as VerticalAxisIcon,
  FlipVertical as HorizontalAxisIcon,
  
  // Action icons
  X as DeleteIcon,
  Plus as PlusIcon,
  
  // Tool icons
  Magnet as MagnetIcon,
  Eye as EyeIcon,
  FileCode as SvgPreviewIcon,
  Ruler as RulerIcon,
  Scan as FrameIcon,
  
  // Edit icons
  Undo2 as UndoIcon,
  Redo2 as RedoIcon,
  
  // Menu icons
  Palette as ThemeIcon,
  Bug as DebugIcon,
  File as FileIcon,
  ChevronDown as ChevronDownIcon,
  Settings as SettingsIcon,
} from 'lucide-react'

// ============================================================================
// CUSTOM UI ICONS
// ============================================================================

interface IconProps {
  size?: number
  className?: string
  color?: string
}

/**
 * Smart Guides Icon - Two circles with an alignment line between them
 * Shows alignment assistance when moving objects
 */
export function SmartGuidesIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top circle */}
      <circle cx="5" cy="4" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Bottom circle */}
      <circle cx="11" cy="12" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Vertical dashed alignment line */}
      <path 
        d="M8 1 L8 15" 
        stroke={color} 
        strokeWidth="1.25" 
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />
    </svg>
  )
}

// ============================================================================
// CUSTOM PATH ICONS
// These are specialized for the vector path editor and don't have good
// equivalents in standard icon libraries
// ============================================================================

/**
 * Loop Path Icon - Continuous closed shape
 * Indicates the path connects end back to start (closed loop)
 */
export function LoopPathIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Closed organic shape - clearly shows a continuous connected path */}
      <path 
        d="M8 2.5 L12.5 5.5 L11.5 11 L4.5 11 L3.5 5.5 Z" 
        stroke={color} 
        strokeWidth="1.75" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * Open Path Icon - Curved line with distinct endpoints
 * Indicates the path has distinct start and end points (not looped)
 */
export function OpenPathIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Curved path - S-curve showing an open bezier path */}
      <path 
        d="M3 11 C6 11, 5 5, 8 5 C11 5, 10 11, 13 11" 
        stroke={color} 
        strokeWidth="1.75" 
        strokeLinecap="round"
        fill="none"
      />
      {/* Start endpoint marker */}
      <circle cx="3" cy="11" r="1.5" fill={color} />
      {/* End endpoint marker */}
      <circle cx="13" cy="11" r="1.5" fill={color} />
    </svg>
  )
}

/**
 * Start Point Icon - Filled dot at start with path line going out
 * Shows that path starts from a specific point
 */
export function StartPointIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Start point - filled circle with ring */}
      <circle cx="4.5" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="4.5" cy="8" r="1.25" fill={color} />
      {/* Path line going out */}
      <path 
        d="M8 8 L14 8" 
        stroke={color} 
        strokeWidth="1.75" 
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * End Point Icon - Path line coming in to a filled dot
 * Shows that path ends at a specific point
 */
export function EndPointIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Path line coming in */}
      <path 
        d="M2 8 L8 8" 
        stroke={color} 
        strokeWidth="1.75" 
        strokeLinecap="round"
      />
      {/* End point - filled circle with ring */}
      <circle cx="11.5" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="11.5" cy="8" r="1.25" fill={color} />
    </svg>
  )
}

// ============================================================================
// CANVAS DRAWING FUNCTIONS
// These draw icons using Canvas 2D API for direct canvas rendering
// ============================================================================

export interface CanvasIconOptions {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  size: number
  color: string
  haloColor?: string
  lineWidth?: number
  uiScale?: number
}

/**
 * Draw Mirror icon on canvas
 */
export function drawMirrorIconCanvas({
  ctx,
  x,
  y,
  size,
  color,
  haloColor,
  lineWidth = 1.5
}: CanvasIconOptions) {
  const halfSize = size / 2
  const arrowHead = size * 0.2
  
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // Draw halo if specified (for visibility on any background)
  if (haloColor) {
    ctx.strokeStyle = haloColor
    ctx.lineWidth = lineWidth + 2
    
    // Left arrow
    ctx.beginPath()
    ctx.moveTo(x - halfSize, y)
    ctx.lineTo(x - halfSize + arrowHead, y - arrowHead)
    ctx.moveTo(x - halfSize, y)
    ctx.lineTo(x - halfSize + arrowHead, y + arrowHead)
    ctx.moveTo(x - halfSize, y)
    ctx.lineTo(x - arrowHead * 0.5, y)
    ctx.stroke()
    
    // Right arrow
    ctx.beginPath()
    ctx.moveTo(x + halfSize, y)
    ctx.lineTo(x + halfSize - arrowHead, y - arrowHead)
    ctx.moveTo(x + halfSize, y)
    ctx.lineTo(x + halfSize - arrowHead, y + arrowHead)
    ctx.moveTo(x + halfSize, y)
    ctx.lineTo(x + arrowHead * 0.5, y)
    ctx.stroke()
  }
  
  // Draw main icon
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  
  // Left arrow
  ctx.beginPath()
  ctx.moveTo(x - halfSize, y)
  ctx.lineTo(x - halfSize + arrowHead, y - arrowHead)
  ctx.moveTo(x - halfSize, y)
  ctx.lineTo(x - halfSize + arrowHead, y + arrowHead)
  ctx.moveTo(x - halfSize, y)
  ctx.lineTo(x - arrowHead * 0.5, y)
  ctx.stroke()
  
  // Right arrow
  ctx.beginPath()
  ctx.moveTo(x + halfSize, y)
  ctx.lineTo(x + halfSize - arrowHead, y - arrowHead)
  ctx.moveTo(x + halfSize, y)
  ctx.lineTo(x + halfSize - arrowHead, y + arrowHead)
  ctx.moveTo(x + halfSize, y)
  ctx.lineTo(x + arrowHead * 0.5, y)
  ctx.stroke()
  
  // Center dashed line (mirror axis)
  ctx.setLineDash([size * 0.1, size * 0.1])
  ctx.lineWidth = lineWidth * 0.7
  ctx.beginPath()
  ctx.moveTo(x, y - halfSize * 0.8)
  ctx.lineTo(x, y + halfSize * 0.8)
  ctx.stroke()
  ctx.setLineDash([])
  
  ctx.restore()
}

/**
 * Draw Delete (X) icon on canvas
 */
export function drawDeleteIconCanvas({
  ctx,
  x,
  y,
  size,
  color,
  haloColor,
  lineWidth = 1.5
}: CanvasIconOptions) {
  const halfSize = size * 0.35
  
  ctx.save()
  ctx.lineCap = 'round'
  
  // Draw halo if specified
  if (haloColor) {
    ctx.strokeStyle = haloColor
    ctx.lineWidth = lineWidth + 2
    
    ctx.beginPath()
    ctx.moveTo(x - halfSize, y - halfSize)
    ctx.lineTo(x + halfSize, y + halfSize)
    ctx.moveTo(x + halfSize, y - halfSize)
    ctx.lineTo(x - halfSize, y + halfSize)
    ctx.stroke()
  }
  
  // Draw main X
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  
  ctx.beginPath()
  ctx.moveTo(x - halfSize, y - halfSize)
  ctx.lineTo(x + halfSize, y + halfSize)
  ctx.moveTo(x + halfSize, y - halfSize)
  ctx.lineTo(x - halfSize, y + halfSize)
  ctx.stroke()
  
  ctx.restore()
}

/**
 * Draw Plus (+) icon on canvas
 */
export function drawPlusIconCanvas({
  ctx,
  x,
  y,
  size,
  color,
  haloColor,
  lineWidth = 1.5
}: CanvasIconOptions) {
  const halfSize = size * 0.4
  
  ctx.save()
  ctx.lineCap = 'round'
  
  // Draw halo if specified
  if (haloColor) {
    ctx.strokeStyle = haloColor
    ctx.lineWidth = lineWidth + 2
    
    ctx.beginPath()
    ctx.moveTo(x - halfSize, y)
    ctx.lineTo(x + halfSize, y)
    ctx.moveTo(x, y - halfSize)
    ctx.lineTo(x, y + halfSize)
    ctx.stroke()
  }
  
  // Draw main +
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  
  ctx.beginPath()
  ctx.moveTo(x - halfSize, y)
  ctx.lineTo(x + halfSize, y)
  ctx.moveTo(x, y - halfSize)
  ctx.lineTo(x, y + halfSize)
  ctx.stroke()
  
  ctx.restore()
}
