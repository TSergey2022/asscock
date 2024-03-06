const vsSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  uniform mat4 mvMatrix;
  uniform mat4 prMatrix;
  varying vec4 color;
  void main(void) {
    gl_Position = prMatrix * mvMatrix * vec4 ( aVertexPosition, 1.0 );
    color = aVertexColor;
  }
`;

const fsSource = `
  #ifdef GL_ES
  precision highp float;
  #endif
  varying vec4 color;
  void main(void) {
    gl_FragColor = color;
  }
`;

function main() {
  rect();
  triangle();
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function makePerspective(angle, a, zMin, zMax) {
  const ang = Math.tan((angle*.5)*Math.PI/180);
  return [
     0.5/ang, 0 , 0, 0,
     0, 0.5*a/ang, 0, 0,
     0, 0, -(zMax+zMin)/(zMax-zMin), -1,
     0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
  ];
}

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function rect() {
  const canvas = document.getElementById('glcanvas1');
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];

  const colors = [
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
  ]

  const squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPositionAttribute);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
  const vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
  gl.enableVertexAttribArray(vertexColorAttribute);
  gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

  const prMatrixUniform = gl.getUniformLocation(shaderProgram, "prMatrix");
  const mvMatrixUniform = gl.getUniformLocation(shaderProgram, "mvMatrix");

  gl.useProgram(shaderProgram, 0, 4);

  const prMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
  const mvMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0,-4, 1
  ];

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(prMatrixUniform, false, prMatrix);
    gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  drawScene();
}

function triangle() {
  const canvas = document.getElementById('glcanvas2');
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const vertices = [ [-1, -1], [+0, +1], [+1, -1], ].flat()

  const colors = [ [1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], ].flat();

  const squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  gl.enableVertexAttribArray(vertexPositionAttribute);
  gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
  const vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
  gl.enableVertexAttribArray(vertexColorAttribute);
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

  const prMatrixUniform = gl.getUniformLocation(shaderProgram, "prMatrix");
  const mvMatrixUniform = gl.getUniformLocation(shaderProgram, "mvMatrix");

  gl.useProgram(shaderProgram, 0, 4);

  const prMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
  const mvMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(prMatrixUniform, false, prMatrix);
    gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  }

  drawScene();
}

main();