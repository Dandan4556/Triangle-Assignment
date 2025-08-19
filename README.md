✨ Triangle Assignment

Interactive web app written in TypeScript that lets you draw a triangle on an canvas and calculates its geometry: side lengths, internal angles, perimeter, and area.

✨ Features

Place 3 points by clicking (or tapping) on the canvas.

Automatically draws the triangle and computes:

Side lengths

Angles (Law of Cosines)

Perimeter & area

Reset button to clear and start over.

High-DPI rendering support.

❓ Questions & Answers

1. Which method did you use to draw the triangle? Why did you choose it?

      I used the HTML5 Canvas API (2D context). I chose it because it is simple, fast, and well-suited for drawing basic shapes like triangles.

2. How did you calculate the angles?

      I measured the side lengths using the Euclidean distance formula, and then applied the Law of Cosines to calculate the angles. The results were converted from radians to degrees.

3. What was challenging in this exercise?

      Handling floating-point precision issues (e.g., the sum of angles being ≈ 179.99° instead of exactly 180°).

      Detecting invalid cases (such as three collinear points).

      Ensuring sharp rendering across different screens and device pixel ratios.

4. Was there anything you couldn’t solve? What gaps did you have?

      All functionality worked as expected. The only parts not fully implemented were:

      Smarter placement of text labels so they don’t overlap lines/points.

      Support for dragging existing points after placing them.

5. Did you use external aids (including AI)? If yes, how did it help?

      I didn’t use external code libraries. I did use AI to refine explanations, verify mathematical formulas, and create a clean README structure.

📂 Tech Stack

TypeScript

HTML5 Canvas

CSS3

serve (local static hosting)
