// geometry.js (dynamic colors & depth)
scale = 0.6;
depth = 0.15; // adjustable

// color arrays (normalized 0..1)
frontColor = [0.0, 0.0, 0.2];   // default front (dark)
sideColor = [0.0, 0.0, 0.639];  // default CGT blue

// geometry storage (rebuild when depth/colors change)
let vertices = [];
let colors = [];
let indices = [];

function buildLogoGeometry() {
  vertices = [];
  colors = [];
  indices = [];
  let idxOffset = 0;

  function createCuboid(x1, y1, x2, y2, zFront = -depth, zBack = depth) {
    const verts = [
      x1, y1, zFront, x2, y1, zFront, x2, y2, zFront, x1, y2, zFront,
      x1, y1, zBack,  x2, y1, zBack,  x2, y2, zBack,  x1, y2, zBack
    ];
    const cols = [];
    for (let i = 0; i < 4; i++) cols.push(...frontColor);
    for (let i = 0; i < 4; i++) cols.push(...sideColor);
    const inds = [
      0,1,2, 0,2,3,
      4,6,5, 4,7,6,
      0,4,5, 0,5,1,
      1,5,6, 1,6,2,
      2,6,7, 2,7,3,
      3,7,4, 3,4,0
    ];
    return { verts, cols, inds };
  }

  // C
  const C_bars = [
    [-1.0*scale, 0.50*scale, -0.45*scale, 0.38*scale],
    [-1.0*scale, 0.38*scale, -0.88*scale, -0.38*scale],
    [-1.0*scale, -0.50*scale, -0.45*scale, -0.38*scale]
  ];
  C_bars.forEach(rect => {
    const { verts: v, cols: c, inds: ind } = createCuboid(rect[0], rect[1], rect[2], rect[3]);
    vertices.push(...v);
    colors.push(...c);
    indices.push(...ind.map(i => i + idxOffset));
    idxOffset += v.length / 3;
  });

  // G
  const G_bars = [
    [-0.3*scale, 0.50*scale, 0.3*scale, 0.38*scale],
    [-0.3*scale, 0.38*scale, -0.2*scale, -0.5*scale],
    [-0.3*scale, -0.50*scale, 0.3*scale, -0.38*scale],
    [0.0*scale, -0.08*scale, 0.3*scale, 0.08*scale],
    [0.20*scale, -0.05*scale, 0.3*scale, -0.4*scale]
  ];
  G_bars.forEach(rect => {
    const { verts: v, cols: c, inds: ind } = createCuboid(rect[0], rect[1], rect[2], rect[3]);
    vertices.push(...v);
    colors.push(...c);
    indices.push(...ind.map(i => i + idxOffset));
    idxOffset += v.length / 3;
  });

  // T
  const T_bars = [
    [0.4*scale, 0.5*scale, 1.0*scale, 0.4*scale],
    [0.65*scale, 0.4*scale, 0.75*scale, -0.5*scale]
  ];
  T_bars.forEach(rect => {
    const { verts: v, cols: c, inds: ind } = createCuboid(rect[0], rect[1], rect[2], rect[3]);
    vertices.push(...v);
    colors.push(...c);
    indices.push(...ind.map(i => i + idxOffset));
    idxOffset += v.length / 3;
  });
}

// initial build
buildLogoGeometry();

function initLogoBuffers(gl) {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return { vertexBuffer, colorBuffer, indexBuffer, vertexCount: indices.length };
}

