// animation.js — single authoritative animate + control API

// animation state (compatible with your geometry.js)
rotationAngle = 0;
rotationDirection = 1; // 1 = right, -1 = left
scaleFactor = 1.0;
scaleUp = true;
hoverOffset = 0;
hoverDirection = 1;
lastTime = null;

isAnimating = false;
animationSpeed = 1.0;
selectedMode = "default"; // default = rotate + bounce

// NEW STATE VARIABLES
animationState = 0; // 0=idle, 1=rotateRight, 2=returnFromRight, 3=rotateLeft, 4=returnFromLeft, 5=scaleUp, 6=finalLoop
targetRotation = 0;
rotationSpeed = Math.PI * 0.8; // radians per second
targetScale = 3.0; // Define the "full-screen" size


// default toggle (ui will set this)
if (typeof window.scaleBounceEnabled === "undefined") window.scaleBounceEnabled = true;

// update transforms
function updateTransforms(dt) {

  // -----------------------------
  // 1. ROTATION (left ↔ right)
  // -----------------------------
  const rotSpeed = Math.PI / 2 * animationSpeed; // 180° per second
  rotationAngle += rotationDirection * rotSpeed * dt;

  if (Math.abs(rotationAngle) > Math.PI) {
      rotationDirection *= -1;  // reverse
  }

  // -----------------------------
  // 2. SCALE BOUNCE (1.0 ↔ 1.5)
  // -----------------------------
  if (window.scaleBounceEnabled) {
      const bounceSpeed = 0.5;
      if (scaleUp) {
          scaleFactor += bounceSpeed * dt;
          if (scaleFactor >= 1.5) scaleUp = false;
      } else {
          scaleFactor -= bounceSpeed * dt;
          if (scaleFactor <= 1.0) scaleUp = true;
      }
  }

  // -----------------------------
  // 3. SCALE UP (like STATE 5)
  // Triggered only when animationState==5
  // -----------------------------
  else if (animationState === 5) {
      const scaleSpeed = 0.5 * animationSpeed;
      scaleFactor += scaleSpeed * dt;

      if (scaleFactor >= targetScale) {
          scaleFactor = targetScale;
          animationState = 6;  // final rotation loop
      }
  }

  // -----------------------------
  // 4. HOVER UP DOWN
  // -----------------------------
  const hoverSpeed = 1.0 * animationSpeed;
  hoverOffset += hoverDirection * hoverSpeed * dt;
  if (Math.abs(hoverOffset) > 0.3) hoverDirection *= -1;

  // -----------------------------
  // 5. COLOR PULSE (faint glow)
  // -----------------------------
  const colorShift = (Math.sin(performance.now() / 500) + 1) / 2;
  gl.clearColor(
    0.9 - 0.2 * colorShift,
    0.9,
    0.9 + 0.1 * colorShift,
    1.0
  );
}

// single animate function
function animate(now) {
  if (!isAnimating) {
    lastTime = null;
    return;
  }
  if (!lastTime) lastTime = now;
  const deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  updateTransforms(deltaTime);

  if (typeof drawScene === "function") drawScene();

  requestAnimationFrame(animate);
}

// public API
// animation.js

function startAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  lastTime = null;
 
  // FIX: START THE SEQUENCE AT STATE 1
  if (animationState === 0 || animationState === 6) {
    animationState = 1;
    // Reset transforms to start state
    rotationAngle = 0;
    scaleFactor = 1.0;
  }
 
  console.log("Animation started. State:", animationState);
  requestAnimationFrame(animate);
}

function stopAnimation() {
  if (!isAnimating) return;
  isAnimating = false;
 
  // OPTIONAL: Reset the state back to idle when stopped
  animationState = 0;
 
  console.log("Animation stopped");
}

function resetAnimation() {
  // Stop animation first
  isAnimating = false;
  animationState = 0;

  // Reset transforms
  rotationAngle = 0;
  rotationDirection = 1;

  scaleFactor = 1.0;
  scaleUp = true;

  hoverOffset = 0;
  hoverDirection = 1;

  lastTime = null;

  // Optional: clear background to default
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  if (typeof drawScene === "function") drawScene();

  console.log("Animation reset");
}

