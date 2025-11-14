// Global variables accessible by animation/geometry
let uiSettings = {
  color: "#00aaff",
  speed: 1.0,
  depth: 1.0,
  mode: "loop",
};

function setupUI() {
  const colorPicker = document.getElementById("colorPicker");
  const speedSlider = document.getElementById("speedSlider");
  const depthSlider = document.getElementById("depthSlider");
  const modeSelect  = document.getElementById("modeSelect");
  const startBtn = document.getElementById("startBtn");
  const stopBtn  = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Real-time updates
  colorPicker.oninput = e => uiSettings.color = e.target.value;
  speedSlider.oninput = e => uiSettings.speed = parseFloat(e.target.value);
  depthSlider.oninput = e => uiSettings.depth = parseFloat(e.target.value);
  modeSelect.onchange = e => uiSettings.mode = e.target.value;

  // Button events
  startBtn.onclick = () => animateFlag = true;
  stopBtn.onclick  = () => animateFlag = false;
  resetBtn.onclick = () => { rotation = 0; scale = 1; };

  // Extra: Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") animateFlag = !animateFlag;  // Space to start/stop
    if (e.key === "r") scale = 1;                  // R to reset
  });

  // Extra: Resize handler
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  const canvas = document.getElementById("glcanvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
