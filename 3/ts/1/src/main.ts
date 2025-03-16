import { mat4 } from 'gl-matrix';

const canvas = document.getElementById('app') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('Canvas element not found');
}

const gl = canvas.getContext('webgl');
if (!gl) {
    alert('WebGL не поддерживается вашим браузером');
}

if (!gl) {
    alert('WebGL не поддерживается вашим браузером');
}

// Вершинный шейдер
const vsSource = `
            attribute vec4 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `;

// Фрагментный шейдер
const fsSource = `
            precision mediump float;
            uniform vec4 uColor;
            void main() {
                gl_FragColor = uColor;
            }
        `;

// Инициализация шейдеров
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        color: gl.getUniformLocation(shaderProgram, 'uColor'),
    },
};

// Создание буферов
const cardioidBuffer = initBuffer(gl, generateCardioidPoints(5, 0.01));
const xAxisBuffer = initBuffer(gl, [-20, 0, 0, 20, 0, 0]);
const yAxisBuffer = initBuffer(gl, [0, -20, 0, 0, 20, 0]);

// Настройка матриц
const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -15]);

// Рендеринг
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Рендеринг кардиоиды
    drawBuffer(gl, cardioidBuffer, programInfo, projectionMatrix, modelViewMatrix, [1.0, 0.0, 0.0, 1.0]);

    // Рендеринг осей
    drawBuffer(gl, xAxisBuffer, programInfo, projectionMatrix, modelViewMatrix, [0.0, 0.0, 1.0, 1.0]);
    drawBuffer(gl, yAxisBuffer, programInfo, projectionMatrix, modelViewMatrix, [0.0, 1.0, 0.0, 1.0]);

    requestAnimationFrame(render);
}

render();

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Ошибка инициализации шейдерной программы: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Ошибка компиляции шейдера: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffer(gl, vertices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return buffer;
}

function drawBuffer(gl, buffer, programInfo, projectionMatrix, modelViewMatrix, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );
    gl.uniform4fv(programInfo.uniformLocations.color, color);

    gl.drawArrays(gl.LINE_STRIP, 0, buffer.numItems || buffer.length / 3);
}

function generateCardioidPoints(a, step) {
    const points = [];
    for (let phi = 0; phi <= 2 * Math.PI; phi += step) {
        const r = a * (1 - Math.cos(phi));
        const x = r * Math.cos(phi);
        const y = r * Math.sin(phi);
        points.push(x, y, 0);
    }
    return points;
}