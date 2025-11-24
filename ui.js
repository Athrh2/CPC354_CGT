// ui.js — connects UI controls to globals & public API

function hexToRgbNorm(hex) {
  const r = parseInt(hex.substr(1,2),16)/255;
  const g = parseInt(hex.substr(3,2),16)/255;
  const b = parseInt(hex.substr(5,2),16)/255;
  return [r,g,b];
}

// ensure toggles exist
if (typeof window.scaleBounceEnabled === "undefined") window.scaleBounceEnabled = true;

function setupUI() {
  const frontPicker = document.getElementById("frontColorPicker");
  const sidePicker  = document.getElementById("sideColorPicker");
  const bgPicker    = document.getElementById("bgColorPicker");
  const sizeSlider  = document.getElementById("sizeSlider");
  const speedSlider = document.getElementById("speedSlider");
  const depthSlider = document.getElementById("depthSlider");
  const rotateDir   = document.getElementById("rotateDir");
  // scale bounce no longer used
  const scaleBounce = null;
  const startBtn    = document.getElementById("startBtn");
  const stopBtn     = document.getElementById("stopBtn");

  if (!frontPicker || !sidePicker || !bgPicker || !sizeSlider || !speedSlider || !depthSlider || !rotateDir || !startBtn || !stopBtn) {
    console.error("UI elements missing — check IDs in HTML");
    return;
  }

  // initial scale from slider
  scaleFactor = parseFloat(sizeSlider.value);

  // front color — rebuild geometry
  frontPicker.addEventListener("input", (e) => {
      // FIX: Using the now-global variable
      frontColor = hexToRgbNorm(e.target.value);
      buildLogoGeometry();
      if (gl) logoBuffers = initLogoBuffers(gl);
      if (typeof drawScene === "function") drawScene();
  });

  // side/back color
  sidePicker.addEventListener("input", (e) => {
    // FIX: Change window.sideColor to just sideColor
    sideColor = hexToRgbNorm(e.target.value);
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  // canvas background -> changes gl.clearColor
  bgPicker.addEventListener("input", (e) => {
    const rgb = hexToRgbNorm(e.target.value);
    if (gl) {
      gl.clearColor(rgb[0], rgb[1], rgb[2], 1.0);
      if (typeof drawScene === "function") drawScene();
    }
  });

  // size slider
  sizeSlider.addEventListener("input", (e) => {
    scaleFactor = parseFloat(e.target.value);
    if (typeof drawScene === "function") drawScene();
  });

  // speed slider
  speedSlider.addEventListener("input", (e) => {
    animationSpeed = parseFloat(e.target.value);
  });

  // depth slider
  depthSlider.addEventListener("input", (e) => {
    depth = parseFloat(e.target.value);
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  // rotation direction
  rotateDir.addEventListener("change", (e) => {
    rotationDirection = (e.target.value === "left") ? -1 : 1;
  });

  // scale bounce removed from interface
  window.scaleBounceEnabled = false;

  // start/stop buttons
  startBtn.addEventListener("click", () => startAnimation());
  stopBtn.addEventListener("click", () => stopAnimation());

  // space toggles
  window.addEventListener("keydown", (ev) => {
    if (ev.code === "Space") {
      ev.preventDefault();
      if (isAnimating) stopAnimation(); else startAnimation();
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

  // apply initial color globals and buffers
  if (typeof frontColor === "undefined") frontColor = hexToRgbNorm(frontPicker.value);
  if (typeof sideColor === "undefined") sideColor = hexToRgbNorm(sidePicker.value);
  buildLogoGeometry();
  if (gl) logoBuffers = initLogoBuffers(gl);
  if (typeof drawScene === "function") drawScene();

  document.getElementById("resetBtn").addEventListener("click", () => {
    resetAnimation();
  });

}
