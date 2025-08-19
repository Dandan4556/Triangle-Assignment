/**
 * Geometry utilities for triangle calculations.
 * Keep this module pure (no DOM / canvas access) so it’s easy to test.
 */

/** A 2D point in canvas / screen coordinates. */
export type Pt = { x: number; y: number };

/** Triangle side lengths mapped to the opposite vertex (a ↔ A, etc.). */
export type TriangleSides = { a: number; b: number; c: number };

/** Triangle internal angles (in degrees), named by vertex. */
export type TriangleAngles = { A: number; B: number; C: number };

/** Metadata returned from triangle analysis. */
export interface TriangleData {
  valid: boolean;          // Whether the triangle is geometrically valid
  reasonIfInvalid?: string;

  sides?: TriangleSides;    // Present only if valid
  angles?: TriangleAngles;  // Present only if valid (degrees)
  perimeter?: number;       // Sum of sides
  area?: number;            // Area (pixels^2)
  mids?: {                  // Midpoints of each side (useful for labeling)
    a: Pt; // midpoint of side a (between B and C)
    b: Pt; // midpoint of side b (between A and C)
    c: Pt; // midpoint of side c (between A and B)
  };
}

/** Small epsilon to guard against floating-point issues. */
const EPS = 1e-9;

/** Clamp a number into [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Euclidean distance between two points. */
export function distance(p: Pt, q: Pt): number {
  // Math.hypot is precise and handles large/small deltas well.
  return Math.hypot(q.x - p.x, q.y - p.y);
}

/** Convert radians to degrees. */
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Signed area *2 (shoelace). Positive if A->B->C is CCW. */
export function doubleSignedArea(A: Pt, B: Pt, C: Pt): number {
  return A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y);
}

/** True if the three points are (almost) collinear. */
export function isCollinear(A: Pt, B: Pt, C: Pt): boolean {
  return Math.abs(doubleSignedArea(A, B, C)) <= EPS;
}

/** Midpoint helper. */
function midpoint(P: Pt, Q: Pt): Pt {
  return { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
}

/**
 * Compute core triangle metrics from 3 points:
 * - side lengths (a,b,c) where a is opposite A (i.e., |BC|)
 * - internal angles (A,B,C) in degrees via Law of Cosines
 * - perimeter, area, and midpoints of sides
 *
 * Robustness notes:
 * - We reject degenerate triangles (collinear or near-zero area).
 * - We clamp cosine inputs into [-1, 1] before Math.acos.
 */
export function triangleData(points: [Pt, Pt, Pt]): TriangleData {
  const [A, B, C] = points;

  // Reject degenerate triangles: coincident points or near-zero distances.
  if (
    (Math.abs(A.x - B.x) < EPS && Math.abs(A.y - B.y) < EPS) ||
    (Math.abs(A.x - C.x) < EPS && Math.abs(A.y - C.y) < EPS) ||
    (Math.abs(B.x - C.x) < EPS && Math.abs(B.y - C.y) < EPS)
  ) {
    return { valid: false, reasonIfInvalid: "Two or more points coincide." };
  }

  // Side lengths: opposite to their respective vertices.
  const a = distance(B, C);
  const b = distance(A, C);
  const c = distance(A, B);

  if (!isFinite(a) || !isFinite(b) || !isFinite(c)) {
    return { valid: false, reasonIfInvalid: "Non-finite side length detected." };
  }

  // Area via shoelace (unsigned).
  const area2 = Math.abs(doubleSignedArea(A, B, C)) / 2; // actual area
  if (area2 <= EPS) {
    return { valid: false, reasonIfInvalid: "Degenerate (collinear) triangle." };
  }

  // Law of Cosines: angle opposite side a is A, etc.
  // cosA = (b^2 + c^2 - a^2) / (2bc)
  const cosA = clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1);
  const cosB = clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1);
  const cosC = clamp((a * a + b * b - c * c) / (2 * a * b), -1, 1);

  const Adeg = toDeg(Math.acos(cosA));
  const Bdeg = toDeg(Math.acos(cosB));
  const Cdeg = toDeg(Math.acos(cosC));

  // Perimeter
  const perimeter = a + b + c;

  // Midpoints for convenient labeling
  const mids = {
    a: midpoint(B, C),
    b: midpoint(A, C),
    c: midpoint(A, B),
  };

  return {
    valid: true,
    sides: { a, b, c },
    angles: { A: Adeg, B: Bdeg, C: Cdeg },
    perimeter,
    area: area2,
    mids,
  };
}
