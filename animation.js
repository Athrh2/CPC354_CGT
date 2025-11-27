// animation.js — single authoritative animate + control API (improved smooth transitions + UI semantics)

// globals
let rotationAngle = 0;          // main orientation (radians)
let scaleFactor = 1.0;          // main scale (current)
let originalScale = 1.0;        // UI chosen scale at start (captured when animation starts)
let hoverOffset = 0;
let hoverDirection = 1;

let lastTime = null;
let isAnimating = false;
let animationSpeed = 1.0;       // UI controlled

// 180 degrees
const ROT180 = Math.PI;
const EPS = 0.0005;

// fixed fullscreen scale (not from UI)
const FULLSCREEN_SCALE = 2.2;

// intended rotation direction (+1 or -1) — controlled from UI
let initialDirection = 1;

// animation state machine
let animationState = 0;
// 0 idle
// 1 rotate initial direction 180°
// 2 back to original (0°)
// 3 rotate opposite direction 180°
// 4 back to original (0°)
// 5 scale up to fullscreen
// 6 hover loop (continuous)


// Helper: move current value towards target by at most maxDelta
function moveTowards(current, target, maxDelta) {
  const diff = target - current;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

// dt in seconds
function updateTransforms(dt) {

  // compute per-frame max deltas (frame-rate independent)
  // rotationSpeedRadians/sec, scaleDelta/sec, hoverDelta/sec
  const baseRotSpeed = Math.PI * animationSpeed * 0.9; // rad/s nominal
  const maxRotDelta = baseRotSpeed * dt;
  const maxScaleDelta = 1.4 * animationSpeed * dt;    // scale units/sec
  const hoverSpeed = 0.4 * animationSpeed;            // units/sec
  const maxHoverDelta = hoverSpeed * dt;

  // -------------------------
  // State 1: rotate initial direction 180°
  // -------------------------
  if (animationState === 1) {
    const target = initialDirection * ROT180;
    rotationAngle = moveTowards(rotationAngle, target, maxRotDelta);

    if (Math.abs(rotationAngle - target) <= EPS) {
      rotationAngle = target;
      animationState = 2;
    }
    return;
  }

  // -------------------------
  // State 2: rotate back to 0°
  // -------------------------
  if (animationState === 2) {
    const target = 0;
    rotationAngle = moveTowards(rotationAngle, target, maxRotDelta);

    if (Math.abs(rotationAngle - target) <= EPS) {
      rotationAngle = 0;
      animationState = 3;
    }
    return;
  }

  // -------------------------
  // State 3: rotate opposite 180°
  // -------------------------
  if (animationState === 3) {
    const target = -initialDirection * ROT180;
    rotationAngle = moveTowards(rotationAngle, target, maxRotDelta);

    if (Math.abs(rotationAngle - target) <= EPS) {
      rotationAngle = target;
      animationState = 4;
    }
    return;
  }

  // -------------------------
  // State 4: rotate back to 0°
  // -------------------------
  if (animationState === 4) {
    const target = 0;
    rotationAngle = moveTowards(rotationAngle, target, maxRotDelta);

    if (Math.abs(rotationAngle - target) <= EPS) {
      rotationAngle = 0;
      animationState = 5;
    }
    return;
  }

  // -------------------------
  // State 5: scale up to fullscreen
  // -------------------------
  if (animationState === 5) {
    // scaleFactor approaches FULLSCREEN_SCALE smoothly
    scaleFactor = moveTowards(scaleFactor, FULLSCREEN_SCALE, maxScaleDelta);

    if (Math.abs(scaleFactor - FULLSCREEN_SCALE) <= EPS) {
      scaleFactor = FULLSCREEN_SCALE;
      animationState = 6;
    }
    return;
  }

  // -------------------------
  // State 6: hover loop continuously
  // -------------------------
  if (animationState === 6) {
    // simple ping-pong hover using capped delta
    hoverOffset += hoverDirection * maxHoverDelta;

    if (hoverOffset >= 0.35) {
      hoverOffset = 0.35;
      hoverDirection = -1;
    } else if (hoverOffset <= -0.35) {
      hoverOffset = -0.35;
      hoverDirection = 1;
    }
    return;
  }

  // state 0 or unknown: do nothing
}

// single animate function
function animate(now) {
  if (!isAnimating) { lastTime = null; return; }
  if (!lastTime) lastTime = now;

  const dt = (now - lastTime) / 1000.0;
  lastTime = now;

  // safety: clamp dt to avoid huge jumps after tab switching
  const safeDt = Math.min(dt, 0.05);

  updateTransforms(safeDt);

  if (typeof drawScene === "function") drawScene();

  requestAnimationFrame(animate);
}

// Public API
function startAnimation() {
  if (isAnimating) return; // can't double-start
  // If we were idle and starting for the first time, capture originalScale
  if (animationState === 0) {
    originalScale = scaleFactor;
    rotationAngle = 0;
    hoverOffset = 0;
    hoverDirection = 1;
    animationState = 1;
  }

  isAnimating = true;
  lastTime = null;
  console.log("Animation started/resumed. State:", animationState);
  requestAnimationFrame(animate);
}

function stopAnimation() {
  if (!isAnimating) return;
  isAnimating = false;
  lastTime = null; // ensure next start resets delta integration
  console.log("Animation paused. State remains:", animationState);
  // do NOT reset state; startAnimation will resume from same state
}

function resetAnimation() {
  // Stop animation first
  isAnimating = false;
  animationState = 0;

  // Reset transforms to defaults
  rotationAngle = 0;
  initialDirection = 1;       // default RIGHT
  scaleFactor = 1.0;          // default size
  originalScale = 1.0;
  hoverOffset = 0;
  hoverDirection = 1;

  lastTime = null;

  // Optional: clear background to default if gl is available
  if (typeof gl !== "undefined" && gl) {
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  if (typeof drawScene === "function") drawScene();

  console.log("Animation reset to defaults");
}

// API used by UI to change parameters safely
function setScaleFromUI(value) {
  const v = Number(value);
  if (isNaN(v)) return;
  scaleFactor = v;
  originalScale = v;
  // If user changes size while animating and we are mid-scale-to-fullscreen,
  // we keep using scaleFactor as the current scale. No other side effects.
  console.log("UI -> scaleFactor:", scaleFactor);
}

function setRotationDirection(dir) {
  // dir expected +1 (right) or -1 (left)
  initialDirection = (dir === -1 ? -1 : 1);
  console.log("UI -> initial rotation direction set to", (initialDirection === 1 ? "RIGHT" : "LEFT"));
}

function setAnimationSpeed(value) {
  const v = Number(value);
  if (isNaN(v)) return;
  animationSpeed = v;
  console.log("UI -> animationSpeed:", animationSpeed);
}
