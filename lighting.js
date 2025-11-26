function initLightingShaders(gl) {
    // Vertex shader — passes normal & position for lighting
    const vsSource = `
        attribute vec3 aVertexPosition;
        attribute vec3 aVertexColor;
        attribute vec3 aVertexNormal;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat3 uNormalMatrix; // for transforming normals

        varying lowp vec3 vColor;
        varying lowp vec3 vNormal;
        varying lowp vec3 vPosition;

        void main(void) {
            vColor = aVertexColor;
            vNormal = normalize(uNormalMatrix * aVertexNormal);
            vPosition = vec3(uModelViewMatrix * vec4(aVertexPosition, 1.0));
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        }
    `;

    // Fragment shader — simple directional light
    const fsSource = `
        precision mediump float;

        varying lowp vec3 vColor;
        varying lowp vec3 vNormal;
        varying lowp vec3 vPosition;

        uniform vec3 uLightDirection;
        uniform vec3 uLightColor;
        uniform vec3 uAmbientColor;

        void main(void) {
            // diffuse = max(dot(normal, lightDir), 0.0)
            float diffuseFactor = max(dot(normalize(vNormal), normalize(uLightDirection)), 0.0);
            vec3 diffuse = diffuseFactor * uLightColor;

            vec3 finalColor = vColor * (diffuse + uAmbientColor);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // helper: compile shader
    function loadShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Shader program link error:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    gl.useProgram(shaderProgram);

    shaderProgram.attribLocations = {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal')
    };

    shaderProgram.uniformLocations = {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        lightDirection: gl.getUniformLocation(shaderProgram, 'uLightDirection'),
        lightColor: gl.getUniformLocation(shaderProgram, 'uLightColor'),
        ambientColor: gl.getUniformLocation(shaderProgram, 'uAmbientColor')
    };

    return shaderProgram;
}

// Utility: create normal vectors for cuboid geometry
function calculateNormals(vertices, indices) {
    const normals = new Array(vertices.length).fill(0.0);
    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]];
        const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
        const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];

        const edge1 = v1.map((v, idx) => v - v0[idx]);
        const edge2 = v2.map((v, idx) => v - v0[idx]);

        const normal = [
            edge1[1]*edge2[2] - edge1[2]*edge2[1],
            edge1[2]*edge2[0] - edge1[0]*edge2[2],
            edge1[0]*edge2[1] - edge1[1]*edge2[0]
        ];

        [i0, i1, i2].forEach(idx => {
            normals[idx] += normal[0];
            normals[idx + 1] += normal[1];
            normals[idx + 2] += normal[2];
        });
    }

    // Normalize all normals
    for (let i = 0; i < normals.length; i += 3) {
        const nx = normals[i], ny = normals[i + 1], nz = normals[i + 2];
        const len = Math.hypot(nx, ny, nz) || 1.0;
        normals[i] /= len;
        normals[i + 1] /= len;
        normals[i + 2] /= len;
    }

    return normals;
}

