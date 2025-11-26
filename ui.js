// ui.js — connects UI controls to globals & public API
<<<<<<< HEAD

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

  // Size slider
  const sizeValue = document.getElementById("sizeValue");
  sizeSlider.addEventListener("input", (e) => {
    scaleFactor = parseFloat(e.target.value);
    sizeValue.textContent = scaleFactor.toFixed(2); // show 2 decimal places
    if (typeof drawScene === "function") drawScene();
  });

  // Speed slider
  const speedValue = document.getElementById("speedValue");
  speedSlider.addEventListener("input", (e) => {
    animationSpeed = parseFloat(e.target.value);
    speedValue.textContent = animationSpeed.toFixed(2);
  });

  // Depth slider
  const depthValue = document.getElementById("depthValue");
  depthSlider.addEventListener("input", (e) => {
    depth = parseFloat(e.target.value);
    depthValue.textContent = depth.toFixed(2);
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

=======

function hexToRgbNorm(hex) {
  const r = parseInt(hex.substr(1,2),16)/255;
  const g = parseInt(hex.substr(3,2),16)/255;
  const b = parseInt(hex.substr(5,2),16)/255;
  return [r,g,b];
>>>>>>> 30126bf662c80d01a192c2097c83f282740facce
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
  const startBtn    = document.getElementById("startBtn");
  const stopBtn     = document.getElementById("stopBtn");

  // Solid/Gradient buttons
  const frontSolidBtn = document.getElementById("frontSolidBtn");
  const frontGradBtn  = document.getElementById("frontGradBtn");
  const backSolidBtn  = document.getElementById("backSolidBtn");
  const backGradBtn   = document.getElementById("backGradBtn");

  if (!frontPicker || !sidePicker || !bgPicker || !sizeSlider || !speedSlider || !depthSlider || !rotateDir || !startBtn || !stopBtn || !frontSolidBtn || !frontGradBtn || !backSolidBtn || !backGradBtn) {
    console.error("UI elements missing — check IDs in HTML");
    return;
  }

  // initial scale from slider
  scaleFactor = parseFloat(sizeSlider.value);

  // front color — rebuild geometry
  frontPicker.addEventListener("input", (e) => {
      frontColor = hexToRgbNorm(e.target.value);
      buildLogoGeometry();
      if (gl) logoBuffers = initLogoBuffers(gl);
      if (typeof drawScene === "function") drawScene();
  });

  // side/back color
  sidePicker.addEventListener("input", (e) => {
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

  // Size slider
  const sizeValue = document.getElementById("sizeValue");
  sizeSlider.addEventListener("input", (e) => {
    scaleFactor = parseFloat(e.target.value);
    sizeValue.textContent = scaleFactor.toFixed(2); // show 2 decimal places
    if (typeof drawScene === "function") drawScene();
  });

  // Speed slider
  const speedValue = document.getElementById("speedValue");
  speedSlider.addEventListener("input", (e) => {
    animationSpeed = parseFloat(e.target.value);
    speedValue.textContent = animationSpeed.toFixed(2);
  });

  // Depth slider
  const depthValue = document.getElementById("depthValue");
  depthSlider.addEventListener("input", (e) => {
    depth = parseFloat(e.target.value);
    depthValue.textContent = depth.toFixed(2);
    buildLogoGeometry();
    if (gl) logoBuffers = initLogoBuffers(gl);
    if (typeof drawScene === "function") drawScene();
  });

  // rotation direction
  rotateDir.addEventListener("change", (e) => {
    rotationDirection = (e.target.value === "left") ? -1 : 1;
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

  // reset button
  document.getElementById("resetBtn").addEventListener("click", () => {
    resetAnimation();
  });
}

