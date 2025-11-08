function initShaders(gl) {
  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
  const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main(void) {
      gl_FragColor = uColor;
    }
  `;
  // compileShader() + linkProgram() here
}
