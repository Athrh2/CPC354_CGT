// Ensure you include glMatrix library in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>

let gl;
let logoBuffers;
let shaderProgram;
// Animation shared variables (from animation.js)
let modelMatrix = mat4.create();

// --- Vertex Shader ---
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

// --- Fragment Shader ---
const fsSource = `
precision mediump float;
varying lowp vec3 vColor;
uniform float uTime;
void main(void) {
    float shine = abs(sin(uTime * 2.0 + gl_FragCoord.x * 0.02));
    vec3 finalColor = mix(vColor, vec3(1.0, 1.0, 1.0), shine * 0.2);
    gl_FragColor = vec4(finalColor, 1.0);
}

`;

// --- Initialize shaders ---
function initShaders() {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    gl.useProgram(shaderProgram);
}

// --- Helper to compile shader ---
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// --- Draw Scene ---
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Update time uniform for animation effects
    const uTime = gl.getUniformLocation(shaderProgram, "uTime");
    gl.uniform1f(uTime, performance.now() / 1000);

    // --- Projection matrix ---
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // --- Model-view matrix ---
    // --- Model-view matrix with animation transforms ---
    const modelViewMatrix = mat4.create();

    // Orbit camera around logo
    const radius = 3.5;
    const camX = Math.sin(rotationAngle) * radius;
    const camZ = Math.cos(rotationAngle) * radius;

    mat4.lookAt(modelViewMatrix, [camX, 0.5, camZ], [0, 0, 0], [0, 1, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [scaleFactor, scaleFactor, scaleFactor]);
    
    // --- Set shader uniforms ---
    const uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    // --- Bind buffers ---
    gl.bindBuffer(gl.ARRAY_BUFFER, logoBuffers.vertexBuffer);
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, logoBuffers.colorBuffer);
    const vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, logoBuffers.indexBuffer);
    gl.drawElements(gl.TRIANGLES, logoBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function animate(currentTime) {
  if (!isAnimating) return; // pause if stopped

  // Calculate delta time
  if (!lastTime) lastTime = currentTime;
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Add “pop-in” intro animation
  if (currentTime < 1500) { // first 1.5 seconds
    const t = currentTime / 1500;
    scaleFactor = Math.min(1.0, t * 1.5); // zoom in
    rotationAngle = Math.sin(t * Math.PI) * 0.3; // small wobble
  }

  // Update transformations
  updateTransforms(deltaTime);

  // Reset model matrix
  mat4.identity(modelMatrix);
  mat4.translate(modelMatrix, modelMatrix, [0, hoverOffset, -6]);
  mat4.rotateY(modelMatrix, modelMatrix, rotationAngle);
  mat4.scale(modelMatrix, modelMatrix, [scaleFactor, scaleFactor, scaleFactor]);

  // Draw logo (Member A’s function)
  drawScene();

  // Next frame
  requestAnimationFrame(animate);
}


// --- Main function ---
function main() {
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl");

    if (!gl) {
        alert("WebGL not supported!");
        return;
    }

    // --- Initialize the logo buffers ---
    logoBuffers = initLogoBuffers(gl); // from geometry.js

    // --- Set viewport and clear color ---
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // --- Compile shaders ---
    initShaders();

    // --- Draw the 3D logo ---
    drawScene();

    // --- Start animation loop ---
    requestAnimationFrame(animate);

}

// --- Run when window loads ---
window.onload = main;