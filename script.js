// script.js (main, shaders, drawScene) — works with geometry.js

let gl;
let logoBuffers;
let shaderProgram;

// simple vertex & fragment shaders (same as before)
const vsSource = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying lowp vec3 vColor;
void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
}
`;

const fsSource = `
precision mediump float;
varying lowp vec3 vColor;
uniform float uTime;
void main(void) {
  float shine = abs(sin(uTime * 2.0 + gl_FragCoord.x * 0.02));
  vec3 pulse = mix(vColor, vec3(1.0), shine * 0.12);
  gl_FragColor = vec4(pulse, 1.0);
}
`;

function initShaders() {
  const vs = loadShader(gl.VERTEX_SHADER, vsSource);
  const fs = loadShader(gl.FRAGMENT_SHADER, fsSource);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vs);
  gl.attachShader(shaderProgram, fs);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader link error:', gl.getProgramInfoLog(shaderProgram));
    return;
  }
  gl.useProgram(shaderProgram);

  shaderProgram.attribLocations = {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
  };
  shaderProgram.uniformLocations = {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    time: gl.getUniformLocation(shaderProgram, 'uTime')
  };
}

function loadShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// script.js (Modified drawScene function)

function drawScene() {
  if (!gl || !logoBuffers || !shaderProgram) return;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ... (Time Uniform remains the same)

  // Projection Matrix setup remains the same
  const fov = 45 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fov, aspect, 0.1, 100.0);

  const modelViewMatrix = mat4.create();
  
  // STEP 1: Position the Camera (Static View)
  // Set a static viewpoint, looking towards the origin [0,0,0]
  // The camera is located at [0, 0, 3.5]
  mat4.lookAt(modelViewMatrix, [0, 0, 3.5], [0,0,0], [0,1,0]);

  // STEP 2: Apply World/Model Transformations (Scale, Translation, Rotation)
  
  // Apply hover offset (translation)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, hoverOffset, 0]);
  
  // Apply rotation around the Y-axis (vertical spin)
  // This is the fix for the spinning
  mat4.rotate(modelViewMatrix, modelViewMatrix, rotationAngle, [0, 1, 0]);
  
  // Apply scale transformation
  mat4.scale(modelViewMatrix, modelViewMatrix, [scaleFactor, scaleFactor, scaleFactor]);

  gl.uniformMatrix4fv(shaderProgram.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    
  gl.bindBuffer(gl.ARRAY_BUFFER, logoBuffers.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, logoBuffers.colorBuffer);
  gl.vertexAttribPointer(shaderProgram.attribLocations.vertexColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexColor);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, logoBuffers.indexBuffer);
  gl.drawElements(gl.TRIANGLES, logoBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function main() {
  const canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl");
  if (!gl) { alert("WebGL not supported"); return; }

  // size canvas
  canvas.width = canvas.clientWidth || 800;
  canvas.height = canvas.clientHeight || 600;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // make sure geometry globals exist
  if (typeof buildLogoGeometry === "function") buildLogoGeometry();
  logoBuffers = initLogoBuffers(gl);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  initShaders();

  // UI must be setup after gl + shaders are ready
  if (typeof setupUI === "function") setupUI();

  // draw initial paused frame
  drawScene();
}

window.addEventListener("DOMContentLoaded", () => {
    main();
});