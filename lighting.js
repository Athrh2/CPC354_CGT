// lighting.js — simple directional + ambient lighting support
// Compatible with existing WebGL pipeline (script.js, geometry.js, animation.js)

// PUBLIC STATE
let lightingEnabled = true;
let ambientLight = [0.3, 0.3, 0.3];     // soft global light
let directionalLight = [0.8, 0.8, 0.8];  // main white directional light
let lightDirection = [0.5, 0.7, 1.0];    // direction vector

// INTERNAL
let lightingUniforms = {};

function initLighting(gl, shaderProgram) {
  // Extend shader with lighting uniforms
  lightingUniforms = {
    ambient: gl.getUniformLocation(shaderProgram, "uAmbientLight"),
    directional: gl.getUniformLocation(shaderProgram, "uDirectionalLightColor"),
    direction: gl.getUniformLocation(shaderProgram, "uLightingDirection"),
    enabled: gl.getUniformLocation(shaderProgram, "uLightingEnabled")
  };

  applyLighting(gl);
}

function applyLighting(gl) {
  if (!lightingUniforms || !lightingUniforms.enabled) return;

  gl.uniform1i(lightingUniforms.enabled, lightingEnabled ? 1 : 0);
  gl.uniform3fv(lightingUniforms.ambient, new Float32Array(ambientLight));
  gl.uniform3fv(lightingUniforms.directional, new Float32Array(directionalLight));

  // Normalize light direction
  const len = Math.sqrt(
    lightDirection[0] * lightDirection[0] +
    lightDirection[1] * lightDirection[1] +
    lightDirection[2] * lightDirection[2]
  ) || 1.0;

  const n = [
    lightDirection[0] / len,
    lightDirection[1] / len,
    lightDirection[2] / len
  ];

  gl.uniform3fv(lightingUniforms.direction, new Float32Array(n));
}

// OPTIONAL API
function setAmbientLight(r, g, b) {
  ambientLight = [r, g, b];
}

function setDirectionalLight(r, g, b) {
  directionalLight = [r, g, b];
}

function setLightDirection(x, y, z) {
  lightDirection = [x, y, z];
}

function enableLighting(flag) {
  lightingEnabled = flag;
}
