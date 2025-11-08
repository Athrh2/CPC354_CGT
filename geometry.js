function initBuffers(gl) {
  const vertices = new Float32Array([
    // Example: simple cube or letter parts
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
     0.0,  0.5, 0.0
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  return {
    vertex: vertexBuffer,
    numVertices: 3
  };
}
