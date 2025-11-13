let rotationAngle = 0;
let rotationDirection = 1; // 1 = right, -1 = left
let scaleFactor = 1.0;
let scaleUp = true;
let hoverOffset = 0;
let hoverDirection = 1;
let lastTime = 0;

let isAnimating = true; // toggle via UI later

function updateTransforms(deltaTime) {
  // Rotation: rotate right 180°, then left 180°
  const rotationSpeed = Math.PI / 2; // 180° in radians per second
  rotationAngle += rotationDirection * rotationSpeed * deltaTime;
  if (Math.abs(rotationAngle) > Math.PI) {
    rotationDirection *= -1; // reverse rotation
  }

  // Scaling: grow to full screen and shrink back
  const scaleSpeed = 0.5;
  if (scaleUp) {
    scaleFactor += scaleSpeed * deltaTime;
    if (scaleFactor >= 1.5) scaleUp = false;
  } else {
    scaleFactor -= scaleSpeed * deltaTime;
    if (scaleFactor <= 1.0) scaleUp = true;
  }

  // Hovering (up & down motion)
  const hoverSpeed = 1.0;
  hoverOffset += hoverDirection * hoverSpeed * deltaTime;
  if (Math.abs(hoverOffset) > 0.3) hoverDirection *= -1;

  // Gradient or color-pulse effect for a glowing or “tech-energy” look
  const colorShift = (Math.sin(performance.now() / 500) + 1) / 2; // 0–1 range
  gl.clearColor(0.9 - 0.2 * colorShift, 0.9, 0.9 + 0.1 * colorShift, 1.0);

}

// --- UI Controls ---
function startAnimation() {
  isAnimating = true;
  requestAnimationFrame(animate);
}

function stopAnimation() {
  isAnimating = false;
}