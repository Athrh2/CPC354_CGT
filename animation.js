let rotation = 0;
let scale = 1;
let animateFlag = false;

function updateTransforms(deltaTime) {
  if (!animateFlag) return;
  rotation += deltaTime * 0.001;
}

function drawAnimatedScene(gl, programInfo, buffers, deltaTime) {
  updateTransforms(deltaTime);
  drawLogo(gl, programInfo, buffers, rotation, scale);
}
