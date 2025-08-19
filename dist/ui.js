/**
 * UI helpers for DOM updates (status output, errors, and formatting).
 * Keep this module focused on presentation only (no canvas drawing here).
 */
/** Grab and cache the output element once for efficient updates. */
const outEl = document.getElementById("out");
/** Format numbers to a consistent precision for display. */
function fmt(n, digits = 2) {
    if (n === undefined || !Number.isFinite(n))
        return "—";
    return n.toFixed(digits);
}
/** Render a valid triangle data block into the output panel. */
export function showResults(data) {
    if (!outEl)
        return;
    if (!data.valid || !data.sides || !data.angles) {
        showError(data.reasonIfInvalid || "Invalid triangle.");
        return;
    }
    const { sides, angles, perimeter, area } = data;
    // Build a readable multi-line block. Avoid innerHTML unless we need markup.
    const text = `צלעות: a=${fmt(sides.a)}, b=${fmt(sides.b)}, c=${fmt(sides.c)}
זוויות: A=${fmt(angles.A)}°, B=${fmt(angles.B)}°, C=${fmt(angles.C)}°
היקף: ${fmt(perimeter)}
שטח: ${fmt(area)}`;
    outEl.textContent = text;
}
/** Show a friendly status while the user clicks points. */
export function showStatus(msg) {
    if (!outEl)
        return;
    outEl.textContent = msg;
}
/** Display an error message (kept simple and accessible). */
export function showError(msg) {
    if (!outEl)
        return;
    outEl.textContent = msg;
}
/** Clear the output panel back to its initial hint. */
export function clearOutput() {
    if (!outEl)
        return;
    outEl.textContent = "אפסנו… סמנו שלוש נקודות חדשות 🙂";
}
//# sourceMappingURL=ui.js.map