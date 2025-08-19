
/**
 * App entrypoint:
 * - wires up canvas interactions (clicks / reset)
 * - manages in-memory state of picked points
 * - delegates math to geometry.ts and text output to ui.ts
 * - performs crisp DPR scaling for high-DPI screens
 */

import type { Pt } from "./geometry.js";                
import { triangleData } from "./geometry.js";
import { clearOutput, showError, showResults, showStatus } from "./ui.js";

// --- DOM references ---
const canvas = document.getElementById("cv") as HTMLCanvasElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
if (!canvas) {
  throw new Error("Canvas element #cv not found");
}
// Definite assignment with runtime guard
let ctx!: CanvasRenderingContext2D;
{
  const maybe = canvas.getContext("2d");
  if (!maybe) {
    throw new Error("2D context not available");
  }
  ctx = maybe;
}
// --- state ---
const points: Pt[] = []; // holds up to 3 points (A,B,C)

// --- DPI / sizing ---
// We draw in CSS pixels while the underlying bitmap is scaled by devicePixelRatio.
// This keeps lines crisp without changing the logical coordinate system.
function resizeForDPR() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // Set the backing store size
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  // Reset the transform, then scale
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
resizeForDPR();
window.addEventListener("resize", () => {
  resizeForDPR();
  draw(); // keep the drawing after resize
});

// --- helpers ---
function getMousePoint(ev: MouseEvent | Touch): Pt {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX ?? 0) - rect.left,
    y: (ev.clientY ?? 0) - rect.top,
  };
}

function drawPoint(p: Pt, label?: string) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  if (label) {
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillStyle = "#111";
    ctx.fillText(label, p.x + 6, p.y - 6);
  }
}

function drawTriangle(A: Pt, B: Pt, C: Pt) {
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#333";
  ctx.stroke();

  ctx.fillStyle = "rgba(64,132,255,0.12)";
  ctx.fill();
}

function clearBoard() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
}

/**
 * Draw routine:
 * - clears the board
 * - draws existing points
 * - if 3 points, draw the triangle
 * - lightly annotate side lengths / angles for better UX
 */
function draw() {
  clearBoard();

  // Draw points first
  points.forEach((p, i) => drawPoint(p, ["A", "B", "C"][i]));

  if (points.length === 3) {
    const [A, B, C] = points as [Pt, Pt, Pt];
    drawTriangle(A, B, C);

    // Optional: annotate computed values on the canvas too
    const data = triangleData([A, B, C]);

    if (!data.valid || !data.sides || !data.angles || !data.mids) {
      // If triangle is invalid, UI module will present the reason
      return;
    }

    const r = (n: number) => n.toFixed(2);

    // Side labels near midpoints
    ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillStyle = "#0a0a0a";
    ctx.fillText(`a=${r(data.sides.a)}`, data.mids.a.x + 6, data.mids.a.y);
    ctx.fillText(`b=${r(data.sides.b)}`, data.mids.b.x + 6, data.mids.b.y);
    ctx.fillText(`c=${r(data.sides.c)}`, data.mids.c.x + 6, data.mids.c.y);

    // Angle labels near vertices
    ctx.fillText(`${r(data.angles.A)}°`, A.x + 8, A.y + 14);
    ctx.fillText(`${r(data.angles.B)}°`, B.x + 8, B.y + 14);
    ctx.fillText(`${r(data.angles.C)}°`, C.x + 8, C.y + 14);
  }
}

// --- interactions ---
function handleClick(ev: MouseEvent) {
  const p = getMousePoint(ev);

  // Reset automatically after user already had 3 points
  if (points.length === 3) points.length = 0;

  points.push(p);
  draw();

  if (points.length < 3) {
    showStatus(`סומנו ${points.length}/3 נקודות…`);
    return;
  }

  // When we have 3 points, compute and render results
  const [A, B, C] = points as [Pt, Pt, Pt];
  const data = triangleData([A, B, C]);

  if (!data.valid) {
    showError(data.reasonIfInvalid || "משולש לא תקין (קולינארי?)");
  } else {
    showResults(data);
  }
}

// Touch support (basic): treat first touch as a click
function handleTouch(ev: TouchEvent) {
  if (ev.touches.length < 1) return;
  const t = ev.touches[0];
  if (!t) return;
  const p = getMousePoint(t);

  if (points.length === 3) points.length = 0;

  points.push(p);
  draw();

  if (points.length === 3) {
    const [A, B, C] = points as [Pt, Pt, Pt];
    const data = triangleData([A, B, C]);
    if (!data.valid) {
      showError(data.reasonIfInvalid || "משולש לא תקין (קולינארי?)");
    } else {
      showResults(data);
    }
  } else {
    showStatus(`סומנו ${points.length}/3 נקודות…`);
  }
}

function handleReset() {
  points.length = 0;
  clearOutput();
  draw();
}

// Register listeners
canvas.addEventListener("click", handleClick);
canvas.addEventListener("touchstart", handleTouch, { passive: true });
resetBtn?.addEventListener("click", handleReset);

// Initial paint
draw();
