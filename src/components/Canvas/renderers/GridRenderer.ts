import type { Point, MirrorAxis } from '../../../types'
import {
  GRID_LEVEL_MULTIPLIER,
  GRID_MIN_SCREEN_SPACING,
  GRID_IDEAL_SCREEN_SPACING,
  GRID_DOT_RADIUS_SCREEN
} from '../../../constants'

/**
 * GPU-optimized multi-level dot grid renderer using cached tile patterns
 * 
 * Instead of drawing individual dots, we:
 * 1. Create a small tile with a single dot
 * 2. Use CanvasPattern (GPU-accelerated texture sampling) to tile it
 * 3. Cache tiles to avoid re-creation
 * 
 * This reduces draw calls from O(n²) dots to O(levels) pattern fills.
 */

// Cache for grid tile patterns - keyed by "spacing_dotRadius_rgb"
// Using OffscreenCanvas for better performance
const tileCache = new Map<string, {
  canvas: OffscreenCanvas | HTMLCanvasElement,
  pattern: CanvasPattern | null,
  tileSize: number,  // Actual tile size (integer) for offset calculations
  lastUsed: number
}>()

// Maximum cache entries before cleanup
const MAX_CACHE_SIZE = 20

// Create an OffscreenCanvas if supported, fallback to HTMLCanvasElement
function createOffscreenCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Get or create a cached tile pattern for a grid level
 * 
 * To ensure different grid levels align perfectly, we:
 * 1. Create tiles at a rounded integer size (required for OffscreenCanvas)
 * 2. Use pattern transform scaling to achieve the EXACT desired spacing
 * 3. Compensate dot radius for the scaling
 * 
 * Returns the pattern, canvas size, and scale factor for transform
 */
function getTilePattern(
  ctx: CanvasRenderingContext2D,
  screenSpacing: number,
  dotRadius: number,
  rgb: { r: number; g: number; b: number }
): { pattern: CanvasPattern; canvasSize: number; scale: number } | null {
  // Don't create patterns for very small spacing (would be too dense)
  if (screenSpacing < 4) return null
  
  // Don't create patterns for very large spacing (would waste memory)
  if (screenSpacing > 500) return null
  
  // Round to integer for canvas (OffscreenCanvas requires integers)
  // Use ceil to ensure we have at least as much space as needed
  const canvasSize = Math.ceil(screenSpacing)
  
  // Scale factor to make pattern repeat at exact screenSpacing
  const scale = screenSpacing / canvasSize
  
  // Compensate dot radius for scaling (so dot appears at correct size after scale)
  const compensatedRadius = dotRadius / scale
  
  // Cache key uses canvasSize and compensatedRadius for uniqueness
  const cacheKey = `${canvasSize}_${compensatedRadius.toFixed(2)}_${rgb.r}_${rgb.g}_${rgb.b}`
  
  const cached = tileCache.get(cacheKey)
  if (cached && cached.pattern) {
    cached.lastUsed = performance.now()
    return { pattern: cached.pattern, canvasSize: cached.tileSize, scale }
  }
  
  // Clean up old cache entries if needed
  if (tileCache.size >= MAX_CACHE_SIZE) {
    const entries = Array.from(tileCache.entries())
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed)
    // Remove oldest half
    for (let i = 0; i < entries.length / 2; i++) {
      tileCache.delete(entries[i][0])
    }
  }
  
  // Create tile canvas at integer size
  const tile = createOffscreenCanvas(canvasSize, canvasSize)
  const tileCtx = tile.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
  if (!tileCtx) return null
  
  // Draw a single dot in the center of the tile
  // Use compensated radius so it appears correct size after pattern scaling
  tileCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  tileCtx.beginPath()
  // Position dot at center of canvas
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2
  tileCtx.arc(centerX, centerY, compensatedRadius, 0, Math.PI * 2)
  tileCtx.fill()
  
  // Create pattern from tile
  const pattern = ctx.createPattern(tile, 'repeat')
  if (!pattern) return null
  
  // Cache it
  tileCache.set(cacheKey, {
    canvas: tile,
    pattern,
    tileSize: canvasSize,
    lastUsed: performance.now()
  })
  
  return { pattern, canvasSize, scale }
}

/**
 * Render multi-level dot grid background with smooth crossfading
 * 
 * Inspired by Unity's scene view grid:
 * - Multiple grid levels visible simultaneously
 * - Each level has different spacing (powers of 5)
 * - Opacity crossfades smoothly between levels as you zoom
 * - Dots maintain constant screen-space size
 * 
 * OPTIMIZED: Uses GPU-accelerated pattern tiling instead of individual arc draws
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  pan: Point,
  zoom: number,
  baseGridSize: number,
  gridColor: string = '#2a2a2a'
) {
  const rgb = parseColor(gridColor)
  
  // Get canvas dimensions in CSS pixels (account for device pixel ratio)
  const dpr = window.devicePixelRatio || 1
  const cssWidth = canvasWidth / dpr
  const cssHeight = canvasHeight / dpr
  
  // Max screen spacing is ideal * multiplier (above this, start fading)
  const MAX_SCREEN_SPACING = GRID_IDEAL_SCREEN_SPACING * GRID_LEVEL_MULTIPLIER
  
  // Calculate the base screen spacing
  const baseScreenSpacing = baseGridSize * zoom
  
  // Determine which level is closest to the ideal screen spacing
  const idealLevel = Math.log(GRID_IDEAL_SCREEN_SPACING / baseScreenSpacing) / Math.log(GRID_LEVEL_MULTIPLIER)
  
  // We'll render levels around this ideal level
  const minLevel = Math.floor(idealLevel) - 1
  const maxLevel = Math.ceil(idealLevel) + 2
  
  // Save context state once before all levels
  ctx.save()
  
  // Reset transform to work in screen space for pattern rendering
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  
  // Render each level
  for (let level = minLevel; level <= maxLevel; level++) {
    const levelMultiplier = Math.pow(GRID_LEVEL_MULTIPLIER, level)
    const levelGridSize = baseGridSize * levelMultiplier
    const levelScreenSpacing = levelGridSize * zoom
    
    // Skip if screen spacing is way too small (would create too many dots)
    if (levelScreenSpacing < GRID_MIN_SCREEN_SPACING * 0.3) continue
    
    // Skip if screen spacing is way too large (dots too spread out)
    if (levelScreenSpacing > MAX_SCREEN_SPACING * 3) continue
    
    // Calculate opacity based on screen spacing
    const opacity = calculateLevelOpacity(levelScreenSpacing, GRID_MIN_SCREEN_SPACING, GRID_IDEAL_SCREEN_SPACING, MAX_SCREEN_SPACING)
    
    if (opacity < 0.01) continue // Skip nearly invisible levels
    
    // Get cached pattern for this level
    const patternResult = getTilePattern(ctx, levelScreenSpacing, GRID_DOT_RADIUS_SCREEN, rgb)
    
    if (patternResult) {
      const { pattern, scale } = patternResult
      
      // GPU-accelerated path: use pattern fill
      ctx.globalAlpha = opacity
      ctx.fillStyle = pattern
      
      // Calculate pattern offset to align with world grid
      // pan values are in CSS pixels - world origin (0,0) appears at screen position (pan.x, pan.y)
      // After scaling, pattern repeats at exactly levelScreenSpacing pixels
      // Dot is at center of the scaled tile, i.e., at (levelScreenSpacing/2, levelScreenSpacing/2)
      
      // Use modulo with the EXACT screen spacing (not canvas size) for proper alignment
      const offsetX = ((pan.x % levelScreenSpacing) + levelScreenSpacing) % levelScreenSpacing
      const offsetY = ((pan.y % levelScreenSpacing) + levelScreenSpacing) % levelScreenSpacing
      
      // Shift by offset minus half-spacing to align dot with world grid
      const patternOffsetX = offsetX - levelScreenSpacing / 2
      const patternOffsetY = offsetY - levelScreenSpacing / 2
      
      // Set pattern transform: first scale to exact spacing, then translate
      // The scale makes the pattern repeat at levelScreenSpacing (not canvasSize)
      // Translate positions the dots to align with world grid
      const matrix = new DOMMatrix()
      matrix.scaleSelf(scale, scale)
      // Translate in scaled coordinates (divide offset by scale)
      matrix.translateSelf(patternOffsetX / scale, patternOffsetY / scale)
      pattern.setTransform(matrix)
      
      // Fill the entire canvas with the pattern
      ctx.fillRect(0, 0, cssWidth, cssHeight)
    } else {
      // Fallback for edge cases: use individual dots (original method)
      // This handles very small or very large spacings that don't work well with patterns
      renderGridLevelFallback(ctx, cssWidth, cssHeight, pan, zoom, dpr, levelGridSize, levelScreenSpacing, opacity, rgb)
    }
  }
  
  ctx.globalAlpha = 1
  ctx.restore()
}

/**
 * Fallback renderer for edge cases where pattern approach doesn't work
 * Uses batched path rendering for better performance than individual arcs
 */
function renderGridLevelFallback(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  pan: Point,
  zoom: number,
  dpr: number,
  levelGridSize: number,
  _levelScreenSpacing: number,
  opacity: number,
  rgb: { r: number; g: number; b: number }
) {
  // Calculate visible area in world coordinates
  // pan.x and pan.y are in CSS pixels
  const worldLeft = -pan.x / zoom
  const worldTop = -pan.y / zoom
  const worldRight = (cssWidth - pan.x) / zoom
  const worldBottom = (cssHeight - pan.y) / zoom
  
  // Find the first grid point inside visible area
  const margin = levelGridSize
  const startX = Math.floor((worldLeft - margin) / levelGridSize) * levelGridSize
  const startY = Math.floor((worldTop - margin) / levelGridSize) * levelGridSize
  const endX = worldRight + margin
  const endY = worldBottom + margin
  
  // Count dots to prevent rendering too many
  const dotsX = Math.ceil((endX - startX) / levelGridSize)
  const dotsY = Math.ceil((endY - startY) / levelGridSize)
  const totalDots = dotsX * dotsY
  
  if (totalDots > 50000) return
  
  // Set up transform for world space drawing
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, pan.x, pan.y)
  ctx.scale(zoom, zoom)
  
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
  
  // Convert fixed screen radius to world radius
  const dotRadiusWorld = GRID_DOT_RADIUS_SCREEN / zoom
  
  // Batch all dots into a single path
  ctx.beginPath()
  for (let x = startX; x <= endX; x += levelGridSize) {
    for (let y = startY; y <= endY; y += levelGridSize) {
      ctx.moveTo(x + dotRadiusWorld, y)
      ctx.arc(x, y, dotRadiusWorld, 0, Math.PI * 2)
    }
  }
  ctx.fill()
  
  ctx.restore()
}

/**
 * Calculate the opacity for a grid level based on its screen spacing
 * 
 * Creates smooth transitions:
 * - Fades in from MIN to IDEAL spacing
 * - Full opacity around IDEAL spacing  
 * - Fades out from IDEAL to MAX spacing
 */
function calculateLevelOpacity(
  screenSpacing: number,
  minSpacing: number,
  idealSpacing: number,
  maxSpacing: number
): number {
  // Normalize the spacing to a 0-1 scale relative to ideal
  // Using log scale since grid levels are exponential
  const logSpacing = Math.log(screenSpacing)
  const logMin = Math.log(minSpacing)
  const logIdeal = Math.log(idealSpacing)
  const logMax = Math.log(maxSpacing)
  
  let opacity: number
  
  if (screenSpacing < minSpacing) {
    // Below minimum - dots would be too dense, keep invisible
    // The level will fade in once it crosses minSpacing
    opacity = 0
  } else if (screenSpacing < idealSpacing) {
    // Between min and ideal - fade in
    const t = (logSpacing - logMin) / (logIdeal - logMin)
    // Use smooth ease-in curve
    opacity = smoothstep(t)
  } else if (screenSpacing < maxSpacing) {
    // Between ideal and max - full opacity with slight fade
    const t = (logSpacing - logIdeal) / (logMax - logIdeal)
    // Stay mostly opaque, then fade
    opacity = 1 - smoothstep(t) * 0.3
  } else {
    // Above max - fade out
    const fadeRange = maxSpacing * 2
    if (screenSpacing > fadeRange) {
      opacity = 0
    } else {
      const t = (screenSpacing - maxSpacing) / (fadeRange - maxSpacing)
      opacity = (1 - smoothstep(t)) * 0.7
    }
  }
  
  return Math.max(0, Math.min(1, opacity))
}

/**
 * Smooth interpolation function (ease in-out)
 */
function smoothstep(t: number): number {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

/**
 * Render the mirror axis line when mirroring is active
 * Draws a dashed line at x=0 (vertical) or y=0 (horizontal)
 * Uses grid color (not accent) since it's non-interactive
 */
export function renderMirrorAxis(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  pan: Point,
  zoom: number,
  gridColor: string = '#2a2a2a',
  axis: MirrorAxis = 'vertical'
) {
  // Calculate visible area in world coordinates
  const worldLeft = -pan.x / zoom
  const worldRight = (canvasWidth - pan.x) / zoom
  const worldTop = -pan.y / zoom
  const worldBottom = (canvasHeight - pan.y) / zoom
  
  // Add some margin to ensure the line extends beyond visible area
  const margin = 100 / zoom
  
  const uiScale = 1 / zoom
  
  // Parse grid color to RGB for alpha blending
  const rgb = parseColor(gridColor)
  
  ctx.save()
  
  ctx.beginPath()
  
  if (axis === 'vertical') {
    // Draw vertical mirror axis line at x = 0
    ctx.moveTo(0, worldTop - margin)
    ctx.lineTo(0, worldBottom + margin)
  } else {
    // Draw horizontal mirror axis line at y = 0
    ctx.moveTo(worldLeft - margin, 0)
    ctx.lineTo(worldRight + margin, 0)
  }
  
  // Dashed line style - uses grid color with higher opacity for visibility
  ctx.setLineDash([12 * uiScale, 6 * uiScale])
  ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
  ctx.lineWidth = 2 * uiScale
  ctx.stroke()
  
  // Draw small marker near the axis
  ctx.setLineDash([])
  ctx.font = `${11 * uiScale}px system-ui, sans-serif`
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  if (axis === 'vertical') {
    ctx.fillText('⧫', 0, worldTop + 30 * uiScale)
  } else {
    ctx.fillText('⧫', worldLeft + 30 * uiScale, 0)
  }
  
  ctx.restore()
}

/**
 * Parse a CSS color string to RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number } {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      }
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      }
    }
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    }
  }
  
  // Default fallback
  return { r: 26, g: 26, b: 26 }
}

/**
 * Clear the tile cache (useful for theme changes)
 */
export function clearGridCache() {
  tileCache.clear()
}
