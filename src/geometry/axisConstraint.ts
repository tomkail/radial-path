import type { Point, MirrorConfig } from '../types'

/**
 * Calculate all constraint axes based on mirror configuration
 * Returns an array of angles (in radians) representing valid constraint directions
 * 
 * For a mirror configuration with N planes:
 * - Each plane defines an axis
 * - The angle between adjacent planes defines another axis
 * - We always include horizontal (0°) and vertical (90°)
 */
export function calculateConstraintAxes(mirrorConfig: MirrorConfig): number[] {
  const axes: number[] = []
  
  // Always include horizontal (0°) and vertical (90°)
  axes.push(0, Math.PI / 2)
  
  if (mirrorConfig.planeCount === 0) {
    // No mirrors, only X/Y axes
    return axes
  }
  
  // Calculate the angular spacing between mirror planes
  const angleStep = Math.PI / mirrorConfig.planeCount
  
  // Add each mirror plane axis
  for (let i = 0; i < mirrorConfig.planeCount; i++) {
    const planeAngle = mirrorConfig.startAngle + i * angleStep
    axes.push(planeAngle)
  }
  
  // Add the bisector axes (between adjacent planes)
  for (let i = 0; i < mirrorConfig.planeCount; i++) {
    const bisectorAngle = mirrorConfig.startAngle + (i + 0.5) * angleStep
    axes.push(bisectorAngle)
  }
  
  // Normalize all angles to [0, π) range (since axes are bidirectional)
  return axes.map(angle => {
    let normalized = angle % Math.PI
    if (normalized < 0) normalized += Math.PI
    return normalized
  }).filter((angle, index, self) => {
    // Remove duplicates (within a small tolerance)
    const tolerance = 0.001
    return self.findIndex(a => Math.abs(a - angle) < tolerance) === index
  }).sort((a, b) => a - b)
}

/**
 * Constrain a movement delta to the nearest axis
 * 
 * @param delta - The desired movement vector
 * @param constraintAxes - Array of valid constraint angles (in radians)
 * @returns The constrained movement vector
 */
export function constrainToNearestAxis(delta: Point, constraintAxes: number[]): Point {
  // If no movement, return as-is
  if (delta.x === 0 && delta.y === 0) {
    return delta
  }
  
  // Calculate the angle of the movement vector
  const movementAngle = Math.atan2(delta.y, delta.x)
  
  // Normalize movement angle to [0, π) range (since axes are bidirectional)
  let normalizedMovementAngle = movementAngle % Math.PI
  if (normalizedMovementAngle < 0) normalizedMovementAngle += Math.PI
  
  // Find the closest constraint axis
  let closestAxis = constraintAxes[0]
  let minDiff = Math.abs(normalizedMovementAngle - closestAxis)
  
  for (const axis of constraintAxes) {
    // Check both the direct difference and the wrapped difference
    const diff1 = Math.abs(normalizedMovementAngle - axis)
    const diff2 = Math.abs(normalizedMovementAngle - axis + Math.PI)
    const diff3 = Math.abs(normalizedMovementAngle - axis - Math.PI)
    const diff = Math.min(diff1, diff2, diff3)
    
    if (diff < minDiff) {
      minDiff = diff
      closestAxis = axis
    }
  }
  
  // Calculate the magnitude of the original movement
  const magnitude = Math.sqrt(delta.x * delta.x + delta.y * delta.y)
  
  // Project the movement onto the closest axis
  // We need to determine which direction along the axis (+ or -) matches the movement better
  const cos1 = Math.cos(closestAxis)
  const sin1 = Math.sin(closestAxis)
  const cos2 = Math.cos(closestAxis + Math.PI)
  const sin2 = Math.sin(closestAxis + Math.PI)
  
  // Project onto both directions and pick the one with larger magnitude
  const proj1 = delta.x * cos1 + delta.y * sin1
  const proj2 = delta.x * cos2 + delta.y * sin2
  
  let constrainedX: number, constrainedY: number
  
  if (Math.abs(proj1) > Math.abs(proj2)) {
    // Use the positive direction
    constrainedX = proj1 * cos1
    constrainedY = proj1 * sin1
  } else {
    // Use the negative direction
    constrainedX = proj2 * cos2
    constrainedY = proj2 * sin2
  }
  
  return { x: constrainedX, y: constrainedY }
}

