// ui.js — connects UI controls to globals & public API (improved control locking + safer wiring)

function hexToRgbNorm(hex) {
  const r = parseInt(hex.substr(1,2),16)/255;
  const g = parseInt(hex.substr(3,2),16)/255;
  const b = parseInt(hex.substr(5,2),16)/255;
  return [r,g,b];
}

function setupUI() {
  const frontPicker = document.getElementById("frontColorPicker");
  const sidePicker  = document.getElementById("sideColorPicker");
  const bgPicker    = document.getElementById("bgColorPicker");
  const sizeSlider  = document.getElementById("sizeSlider");
  const speedSlider = document.getElementById("speedSlider");
  const depthSlider = document.getElementById("depthSlider");
  const rotateDir   = document.getElementById("rotateDir");
  const startBtn    = document.getElementById("startBtn");
  const stopBtn     = document.getElementById("stopBtn");
  const resetBtn    = document.getElementById("resetBtn");

  // Solid/Gradient buttons
  const frontSolidBtn = document.getElementById("frontSolidBtn");
  const frontGradBtn  = document.getElementById("frontGradBtn");
  const backSolidBtn  = document.getElementById("backSolidBtn");
  const backGradBtn   = document.getElementById("backGradBtn");

  // UI value displays
  const sizeValue = document.getElementById("sizeValue");
  const speedValue = document.getElementById("speedValue");
  const depthValue = document.getElementById("depthValue");

  if (!frontPicker || !sidePicker || !bgPicker || !sizeSlider || !speedSlider || !depthSlider || !rotateDir 
      || !startBtn || !stopBtn || !resetBtn || !frontSolidBtn || !frontGradBtn || !backSolidBtn || !backGradBtn
      || !sizeValue || !speedValue || !depthValue) {
    console.error("UI elements missing — check IDs in HTML");
    return;
  }

  // Default UI values ("reset" defaults)
  const DEFAULTS = {
    size: 1.0,
    speed: 1.0,
    depth: 0.2,
    rotate: "right", // "right" or "left"
    bgColor: bgPicker.value,
    frontColor: frontPicker.value,
    sideColor: sidePicker.value
  };

  // initialize global variables that animation.js expects
  // scaleFactor and animationSpeed are globals defined in animation.js
  // ensure they exist (in case ui.js loaded first)
  if (typeof scaleFactor === "undefined") window.scaleFactor = parseFloat(sizeSlider.value) || DEFAULTS.size;
  if (typeof animationSpeed === "undefined") window.animationSpeed = parseFloat(speedSlider.value) || DEFAULTS.speed;
  if (typeof initialDirection === "undefined") window.initialDirection = (rotateDir.value === "left" ? -1 : 1);

  // apply initial scale from slider
  scaleFactor = parseFloat(sizeSlider.value || DEFAULTS.size);
  sizeValue.textContent = scaleFactor.toFixed(2);
  speedValue.textContent = (parseFloat(speedSlider.value) || DEFAULTS.speed).toFixed(2);
  depthValue.textContent = (parseFloat(depthSlider.value) || DEFAULTS.depth).toFixed(2);

  // helper to enable/disable UI elements during animation
  function setUIEnabled(enabled) {
    // Controls we choose to lock during animation: size, rotate direction, depth, color mode switches
    sizeSlider.disabled = !enabled;
    rotateDir.disabled = !enabled;
    depthSlider.disabled = !enabled;

    // start/stop/reset logic handled separately
    // note: color pickers remain enabled so user can adjust colors while animating
    // note: speed slider remains enabled so user can adjust speed while animating
    frontSolidBtn.disabled = false;
    frontGradBtn.disabled = false;
    backSolidBtn.disabled = false;
    backGradBtn.disabled = false;
    frontPicker.disabled = false;
    sidePicker.disabled = false;
    bgPicker.disabled = false;}
    speedSlider.disabled = false;

  // color pickers — rebuild geometry and redraw
  frontPicker.addEventListener("input", (e) => {
      frontColor = hexToRgbNorm(e.target.value);
      buildLogoGeometry();
      if (gl) logoBuffers = initLogoBuffers(gl);
      if (typeof drawScene === "function") drawScene();
  });

  sidePicker.addEventListener("input", (e) => {
    sideColor = hexToRgbNorm(e.target.value);
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  bgPicker.addEventListener("input", (e) => {
    const rgb = hexToRgbNorm(e.target.value);
    if (gl) {
      gl.clearColor(rgb[0], rgb[1], rgb[2], 1.0);
      if (typeof drawScene === "function") drawScene();
    }
  });


  // Size slider
  sizeSlider.addEventListener("input", (e) => {
    setScaleFromUI(e.target.value); // calls animation.js API
    sizeValue.textContent = parseFloat(e.target.value).toFixed(2);
    if (typeof drawScene === "function") drawScene();
  });

  // Speed slider
  speedSlider.addEventListener("input", (e) => {
    setAnimationSpeed(e.target.value); // calls animation.js API
    speedValue.textContent = parseFloat(e.target.value).toFixed(2);
  });

  // Depth slider
  depthSlider.addEventListener("input", (e) => {
    depth = parseFloat(e.target.value);
    depthValue.textContent = depth.toFixed(2);
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  // Rotation direction (select)
  rotateDir.addEventListener("change", (e) => {
    const dir = (e.target.value === "left") ? -1 : 1;
    setRotationDirection(dir); // calls animation.js API
  });

  // Solid/Gradient buttons
  frontSolidBtn.addEventListener("click", () => {
    frontColorMode = "solid";
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    drawScene();
  });
  frontGradBtn.addEventListener("click", () => {
    frontColorMode = "gradient";
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    drawScene();
  });
  backSolidBtn.addEventListener("click", () => {
    sideColorMode = "solid";
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    drawScene();
  });
  backGradBtn.addEventListener("click", () => {
    sideColorMode = "gradient";
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    drawScene();
  });

  // -------------------------
  // start/stop/reset buttons
  // -------------------------
  startBtn.addEventListener("click", () => {
    startAnimation(); // animation.js
    // update buttons & lock UI
    startBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = false;
    setUIEnabled(false);
  });

  stopBtn.addEventListener("click", () => {
    stopAnimation(); // animation.js
    // allow resume: start enabled, stop disabled
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    setUIEnabled(true); // allow user to tweak locked controls before resuming if they want
  });

  resetBtn.addEventListener("click", () => {
    resetAnimation(); // animation.js
    // restore UI defaults & enable controls
    sizeSlider.value = DEFAULTS.size;
    speedSlider.value = DEFAULTS.speed;
    depthSlider.value = DEFAULTS.depth;
    rotateDir.value = DEFAULTS.rotate;
    frontPicker.value = DEFAULTS.frontColor;
    sidePicker.value = DEFAULTS.sideColor;
    bgPicker.value = DEFAULTS.bgColor;

    sizeValue.textContent = parseFloat(DEFAULTS.size).toFixed(2);
    speedValue.textContent = parseFloat(DEFAULTS.speed).toFixed(2);
    depthValue.textContent = parseFloat(DEFAULTS.depth).toFixed(2);

    // call APIs to ensure sync
    setScaleFromUI(DEFAULTS.size);
    setAnimationSpeed(DEFAULTS.speed);
    setRotationDirection((DEFAULTS.rotate === "left") ? -1 : 1);

    // rebuild geometry/redraw
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();

    // enable/disable appropriate buttons
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    setUIEnabled(true);
  });

  // Space toggles (same semantics)
  window.addEventListener("keydown", (ev) => {
    if (ev.code === "Space") {
      ev.preventDefault();
      if (isAnimating) {
        stopAnimation();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
        setUIEnabled(true);
      } else {
        startAnimation();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = true;
        setUIEnabled(false);
      }
    }
  });

  // resize handler
  window.addEventListener("resize", () => {
    const canvas = document.getElementById("glCanvas");
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    if (typeof drawScene === "function") drawScene();
  });

  // apply initial color globals and buffers (safeguard)
  if (typeof frontColor === "undefined") frontColor = hexToRgbNorm(frontPicker.value);
  if (typeof sideColor === "undefined") sideColor = hexToRgbNorm(sidePicker.value);
  buildLogoGeometry();
  if (gl) logoBuffers = initLogoBuffers(gl);
  if (typeof drawScene === "function") drawScene();

  // initial button state
  startBtn.disabled = false;
  stopBtn.disabled = true;
  resetBtn.disabled = false;
  setUIEnabled(true);
}
