function setupUI() {
  const colorPicker = document.getElementById("colorPicker");
  const speedSlider = document.getElementById("speedSlider");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  colorPicker.oninput = e => currentColor = e.target.value;
  speedSlider.oninput = e => animationSpeed = parseFloat(e.target.value);
  startBtn.onclick = () => animateFlag = true;
  stopBtn.onclick = () => animateFlag = false;
}
