// ui.js — updated with gradient/solid color option

function hexToRgbNorm(hex) {
  const r = parseInt(hex.substr(1,2),16)/255;
  const g = parseInt(hex.substr(3,2),16)/255;
  const b = parseInt(hex.substr(5,2),16)/255;
  return [r,g,b];
}

if (typeof window.scaleBounceEnabled === "undefined") window.scaleBounceEnabled = true;
if (typeof window.rimPower === "undefined") window.rimPower = 3.0;
if (typeof window.frontColorMode === "undefined") window.frontColorMode = 'solid'; // default front color mode
if (typeof window.sideColorMode === "undefined") window.sideColorMode = 'solid';  // default side color mode

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

  const frontMode = document.getElementById("frontColorMode");
  const sideMode = document.getElementById("sideColorMode");

  if (!frontPicker || !sidePicker || !bgPicker || !sizeSlider || !speedSlider || !depthSlider || !rotateDir || !startBtn || !stopBtn || !frontMode || !sideMode) {
    console.error("UI elements missing — check IDs in HTML");
    return;
  }

  scaleFactor = parseFloat(sizeSlider.value);

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

  frontMode.addEventListener("change", (e) => {
    window.frontColorMode = e.target.value; // 'solid' or 'gradient'
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  sideMode.addEventListener("change", (e) => {
    window.sideColorMode = e.target.value;
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

  const sizeValue = document.getElementById("sizeValue");
  sizeSlider.addEventListener("input", (e) => {
    scaleFactor = parseFloat(e.target.value);
    sizeValue.textContent = scaleFactor.toFixed(2);
    if (typeof drawScene === "function") drawScene();
  });

  const speedValue = document.getElementById("speedValue");
  speedSlider.addEventListener("input", (e) => {
    animationSpeed = parseFloat(e.target.value);
    speedValue.textContent = animationSpeed.toFixed(2);
  });

  const depthValue = document.getElementById("depthValue");
  depthSlider.addEventListener("input", (e) => {
    depth = parseFloat(e.target.value);
    depthValue.textContent = depth.toFixed(2);
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  rotateDir.addEventListener("change", (e) => {
    rotationDirection = (e.target.value === "left") ? -1 : 1;
  });

  window.scaleBounceEnabled = false;

  startBtn.addEventListener("click", () => startAnimation());
  stopBtn.addEventListener("click", () => stopAnimation());

  window.addEventListener("keydown", (ev) => {
    if (ev.code === "Space") {
      ev.preventDefault();
      if (isAnimating) stopAnimation(); else startAnimation();
    }
  });

  window.addEventListener("resize", () => {
    const canvas = document.getElementById("glCanvas");
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    if (typeof drawScene === "function") drawScene();
  });

  if (typeof frontColor === "undefined") frontColor = hexToRgbNorm(frontPicker.value);
  if (typeof sideColor === "undefined") sideColor = hexToRgbNorm(sidePicker.value);
  buildLogoGeometry();
  if (gl) logoBuffers = initLogoBuffers(gl);
  if (typeof drawScene === "function") drawScene();

  document.getElementById("resetBtn").addEventListener("click", () => {
    resetAnimation();
  });
}
