let gl, programInfo, buffers;
let lastTime = 0;

function main() {
  const canvas = document.getElementById("glcanvas");
  gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL not supported");
    return;
  }

  programInfo = initShaders(gl);
  buffers = initBuffers(gl);
  setupUI();

  requestAnimationFrame(render);
}

function render(now) {
  now *= 0.001; // ms to seconds
  const deltaTime = now - lastTime;
  lastTime = now;

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawAnimatedScene(gl, programInfo, buffers, deltaTime);

  requestAnimationFrame(render);
}

window.onload = main;
