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
 * Path mode values for the cycle button
 */
export type PathMode = 'tangent' | 'left-arc' | 'right-arc' | 'both-arcs' | 'closed'

interface PathModeIconProps extends IconProps {
  mode: PathMode
}

/**
 * Path Mode Icon - Shows two circles with connecting path
 * Used as a cycle button to switch between 5 path construction modes:
 * 1. tangent - straight line only
 * 2. left-arc - left semicircle arc
 * 3. right-arc - right semicircle arc
 * 4. both-arcs - both arcs (open path)
 * 5. closed - complete closed stadium shape
 */
export function PathModeIcon({ size = 16, className, color = 'currentColor', mode }: PathModeIconProps) {
  // Circle centers and radius for the stadium shape
  // Left circle center: (4.5, 8), Right circle center: (11.5, 8), radius: 3.5
  const leftCx = 4.5
  const rightCx = 11.5
  const cy = 8
  const r = 3.5
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Guide circles (always shown, subtle) */}
      <circle cx={leftCx} cy={cy} r={r} stroke={color} strokeWidth="0.75" opacity="0.3" fill="none" />
      <circle cx={rightCx} cy={cy} r={r} stroke={color} strokeWidth="0.75" opacity="0.3" fill="none" />
      
      {/* Active path segments based on mode */}
      {mode === 'tangent' && (
        /* Just the bottom tangent line */
        <line 
          x1={leftCx} y1={cy + r} 
          x2={rightCx} y2={cy + r} 
          stroke={color} 
          strokeWidth="1.75" 
          strokeLinecap="round"
        />
      )}
      
      {mode === 'left-arc' && (
        /* Left arc + bottom tangent */
        <path 
          d={`M ${rightCx} ${cy + r} L ${leftCx} ${cy + r} A ${r} ${r} 0 1 1 ${leftCx} ${cy - r}`}
          stroke={color} 
          strokeWidth="1.75" 
          strokeLinecap="round"
          fill="none"
        />
      )}
      
      {mode === 'right-arc' && (
        /* Right arc + bottom tangent */
        <path 
          d={`M ${leftCx} ${cy + r} L ${rightCx} ${cy + r} A ${r} ${r} 0 1 0 ${rightCx} ${cy - r}`}
          stroke={color} 
          strokeWidth="1.75" 
          strokeLinecap="round"
          fill="none"
        />
      )}
      
      {mode === 'both-arcs' && (
        /* Both arcs + bottom tangent (open at top) */
        <path 
          d={`M ${leftCx} ${cy - r} A ${r} ${r} 0 1 0 ${leftCx} ${cy + r} L ${rightCx} ${cy + r} A ${r} ${r} 0 1 0 ${rightCx} ${cy - r}`}
          stroke={color} 
          strokeWidth="1.75" 
          strokeLinecap="round"
          fill="none"
        />
      )}
      
      {mode === 'closed' && (
        /* Complete closed stadium shape */
        <path 
          d={`M ${leftCx} ${cy - r} A ${r} ${r} 0 1 0 ${leftCx} ${cy + r} L ${rightCx} ${cy + r} A ${r} ${r} 0 1 0 ${rightCx} ${cy - r} Z`}
          stroke={color} 
          strokeWidth="1.75" 
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </svg>
  )
}

/**
 * Loop Path Icon - Continuous closed shape (legacy, uses PathModeIcon)
 */
export function LoopPathIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return <PathModeIcon size={size} className={className} color={color} mode="closed" />
}

/**
 * Open Path Icon - Open path with both arcs (legacy, uses PathModeIcon)
 */
export function OpenPathIcon({ size = 16, className, color = 'currentColor' }: IconProps) {
  return <PathModeIcon size={size} className={className} color={color} mode="both-arcs" />
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
