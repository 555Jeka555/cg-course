import './index.css'
import {createShaderProgram, computeOrthoMatrix, getWorldSize} from './Utils.ts'
import {Crankcase} from "./Crankcase";
import {Piston} from "./Piston";
import {ConnectingRod} from "./ConnectingRod";
// import { mat4 } from 'gl-matrix';
import {Crankshaft} from "./Crankshaft";
import {Valve} from "./Valve";

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private orthoMatrix: Float32Array<any>
	private crankcase: Crankcase
	private piston: Piston
	private connectingRod: ConnectingRod
	private crankshaft: Crankshaft
	private leftValve: Valve
	private rightValve: Valve

	constructor() {
		this.canvas = document.createElement('canvas')
		document.body.appendChild(this.canvas)
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		const gl = this.canvas.getContext('webgl')
		if (!gl) {
			throw new Error('WebGL не поддерживается')
		}
		this.gl = gl
		this.program = createShaderProgram(gl)
		gl.useProgram(this.program)
		this.orthoMatrix = computeOrthoMatrix(this.canvas.width, this.canvas.height)

		const {width, height} = getWorldSize()

		this.crankcase = new Crankcase(gl, this.program)
		this.piston = new Piston(gl, this.program)
		this.connectingRod = new ConnectingRod(gl, this.program)
		this.crankshaft = new Crankshaft(gl, this.program)
		this.leftValve = new Valve(gl, this.program, -0.5, 1, 0.1, 0.3, [0.2, 0.8, 0.2, 1]);
		this.rightValve = new Valve(gl, this.program, 0.5, 1, 0.1, 0.3, [0.2, 0.2, 0.8, 1]);
		window.addEventListener('resize', this.resizeCanvas)
	}

	render = () => {
		requestAnimationFrame(this.render)
		const gl = this.gl

		const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		gl.uniformMatrix4fv(matrixLocation, false, this.orthoMatrix)

		this.crankcase.render()
		this.crankshaft.render()
		this.piston.render()
		this.connectingRod.render()
		this.leftValve.render()
		this.rightValve.render()
	}

	private computeSkyColor(sunHeight: number) {
		const minColor = {r: 0.05, g: 0.05, b: 0.2}

		if (sunHeight > 0) {
			return {
				r: minColor.r + (0.53 - minColor.r) * sunHeight,
				g: minColor.g + (0.81 - minColor.g) * sunHeight,
				b: minColor.b + (0.98 - minColor.b) * sunHeight,
			}
		}

		return minColor
	}

	private resizeCanvas = () => {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
		this.orthoMatrix = computeOrthoMatrix(window.innerWidth, window.innerHeight)
	}
}

const app = new App()
app.render()


// const canvas = document.createElement('canvas');
// document.body.appendChild(canvas);
// const gl = canvas.getContext('webgl');
//
// if (!gl) {
// 	console.error('WebGL not supported');
// }
//
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
// gl.viewport(0, 0, canvas.width, canvas.height);

// function parseOBJ(content) {
// 	const vertices = [];
// 	const uvs = [];
// 	const indices = [];
//
// 	const lines = content.split('\n');
// 	lines.forEach(line => {
// 		const parts = line.trim().split(/\s+/); // Разделяем строку по пробелам
// 		console.log(parts)
// 		if (parts[0] === 'v') {
// 			// Вершины
// 			vertices.push(...parts.slice(1, 4).map(parseFloat)); // Берём только x, y, z
// 		} else if (parts[0] === 'vt') {
// 			// UV-координаты
// 			uvs.push(...parts.slice(1, 3).map(parseFloat)); // Берём только u, v
// 		} else if (parts[0] === 'f') {
// 			// Грани (индексы)
// 			parts.slice(1).forEach(part => {
// 				const indicesForFace = part.split('/').map(index => parseInt(index) - 1); // Преобразуем в индексы (начиная с 0)
// 				indices.push(...indicesForFace);
// 			});
// 		}
// 	});
//
// 	return { vertices, uvs, indices };
// }
//
// // Загружаем файл .obj
// fetch('test2.obj')
// 	.then(response => response.text())
// 	.then(content => {
// 		const { vertices, uvs, indices } = parseOBJ(content);
//
// 		// Создаем буферы
// 		const vertexBuffer = gl.createBuffer();
// 		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
//
// 		const uvBuffer = gl.createBuffer();
// 		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
// 		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
//
// 		const indexBuffer = gl.createBuffer();
// 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
// 		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
//
// 		// Шейдеры
// 		const vsSource = `
//             attribute vec4 aPosition;
//             attribute vec2 aUV;
//             varying vec2 vUV;
//             void main() {
//                 gl_Position = aPosition;
//                 vUV = aUV;
//             }
//         `;
//
// 		const fsSource = `
//             precision mediump float;
//             varying vec2 vUV;
//             void main() {
//                 gl_FragColor = vec4(vUV, 0.0, 1.0); // Используем UV-координаты как цвет
//             }
//         `;
//
// 		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
// 		gl.shaderSource(vertexShader, vsSource);
// 		gl.compileShader(vertexShader);
//
// 		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
// 		gl.shaderSource(fragmentShader, fsSource);
// 		gl.compileShader(fragmentShader);
//
// 		const shaderProgram = gl.createProgram();
// 		gl.attachShader(shaderProgram, vertexShader);
// 		gl.attachShader(shaderProgram, fragmentShader);
// 		gl.linkProgram(shaderProgram);
// 		gl.useProgram(shaderProgram);
//
// 		// Привязываем атрибуты
// 		const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
// 		gl.enableVertexAttribArray(positionAttributeLocation);
// 		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 		gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
//
// 		const uvAttributeLocation = gl.getAttribLocation(shaderProgram, 'aUV');
// 		gl.enableVertexAttribArray(uvAttributeLocation);
// 		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
// 		gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
//
// 		// Очищаем экран и рисуем объект
// 		gl.clearColor(0.0, 0.0, 0.0, 1.0);
// 		gl.clear(gl.COLOR_BUFFER_BIT);
// 		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
//
// 		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
// 			console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
// 		}
// 		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
// 			console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
// 		}
// 		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
// 			console.error('Shader program error:', gl.getProgramInfoLog(shaderProgram));
// 		}
//
// 		console.log('Parsed vertices:', vertices);
// 		console.log('Parsed uvs:', uvs);
// 		console.log('Parsed indices:', indices);
// 	})
// 	.catch(error => console.error('Error loading OBJ file:', error));

// fetch('test2.glb')
// 	.then(response => {
// 		if (!response.ok) {
// 			throw new Error(`HTTP error! Status: ${response.status}`);
// 		}
// 		return response.arrayBuffer();
// 	})
// 	.then(arrayBuffer => {
// 		console.log('File loaded successfully. Size:', arrayBuffer.byteLength);
//
// 		const dataView = new DataView(arrayBuffer);
//
// 		// Проверка магического числа
// 		const magic = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, 4));
// 		console.log('Magic:', magic); // Должно быть "glTF"
//
// 		if (magic !== 'glTF') {
// 			throw new Error('Invalid GLB file: Missing magic number "glTF"');
// 		}
//
// 		// Чтение версии (4 байта, little-endian)
// 		const version = dataView.getUint32(4, true);
// 		console.log('Version:', version); // Должно быть 2
//
// 		if (version !== 2) {
// 			throw new Error(`Unsupported glTF version: ${version}. Expected version 2.`);
// 		}
//
// 		// Чтение длины файла (4 байта, little-endian)
// 		const length = dataView.getUint32(8, true);
// 		console.log('Length:', length);
//
// 		// Парсинг чанков
// 		let chunkOffset = 12;
// 		let jsonChunk, binChunk;
//
// 		while (chunkOffset < length) {
// 			const chunkLength = dataView.getUint32(chunkOffset, true);
// 			const chunkType = dataView.getUint32(chunkOffset + 4, true);
// 			const chunkData = new Uint8Array(arrayBuffer, chunkOffset + 8, chunkLength);
//
// 			if (chunkType === 0x4E4F534A) { // JSON-чанк
// 				const decoder = new TextDecoder('utf-8');
// 				jsonChunk = JSON.parse(decoder.decode(chunkData));
// 				console.log('JSON chunk:', jsonChunk);
// 			} else if (chunkType === 0x004E4942) { // BIN-чанк
// 				binChunk = chunkData.buffer;
// 				console.log('BIN chunk size:', binChunk.byteLength);
// 			}
//
// 			chunkOffset += 8 + chunkLength;
// 		}
//
// 		if (!jsonChunk || !binChunk) {
// 			throw new Error('GLB file is missing JSON or BIN chunk');
// 		}
//
// 		// Извлечение данных вершин и индексов
// 		const mesh = jsonChunk.meshes[0]; // Берём первый меш
// 		const accessor = jsonChunk.accessors[mesh.primitives[0].attributes.POSITION]; // Доступ к вершинам
// 		const bufferView = jsonChunk.bufferViews[accessor.bufferView]; // Буфер вершин
// 		const byteOffset = bufferView.byteOffset || 0;
// 		const vertices = new Float32Array(binChunk, byteOffset, accessor.count * 3); // Извлекаем вершины
//
// 		const indexAccessor = jsonChunk.accessors[mesh.primitives[0].indices]; // Доступ к индексам
// 		const indexBufferView = jsonChunk.bufferViews[indexAccessor.bufferView]; // Буфер индексов
// 		const indexByteOffset = indexBufferView.byteOffset || 0;
// 		const indices = new Uint16Array(binChunk, indexByteOffset, indexAccessor.count); // Извлекаем индексы
//
// 		// Создаем буферы
// 		const vertexBuffer = gl.createBuffer();
// 		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
//
// 		const indexBuffer = gl.createBuffer();
// 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
// 		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
//
// 		// Очищаем экран
// 		gl.clearColor(0.0, 0.0, 0.0, 1.0); // Чёрный цвет фона
// 		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//
// 		// Шейдеры
// 		const vsSource = `
//              attribute vec2 position;
// 			  uniform mat4 u_matrix;
//
// 			  void main() {
// 				gl_Position = u_matrix * vec4(position, 0.0, 1.0);
// 			  }
//         `;
//
// 		const fsSource = `
// 				precision mediump float;
// 				  uniform vec4 u_color;
//
// 				  void main() {
// 					gl_FragColor = u_color;
// 				  }
//         `;
//
// 		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
// 		gl.shaderSource(vertexShader, vsSource);
// 		gl.compileShader(vertexShader);
//
// 		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
// 		gl.shaderSource(fragmentShader, fsSource);
// 		gl.compileShader(fragmentShader);
//
// 		const shaderProgram = gl.createProgram();
// 		gl.attachShader(shaderProgram, vertexShader);
// 		gl.attachShader(shaderProgram, fragmentShader);
// 		gl.linkProgram(shaderProgram);
// 		gl.useProgram(shaderProgram);
//
// 		// Привязываем атрибуты
// 		const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
// 		gl.enableVertexAttribArray(positionAttributeLocation);
// 		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 		gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
//
// 		// Отрисовка объекта
// 		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
//
// 		// Проверка шейдеров
// 		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
// 			console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
// 		}
// 		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
// 			console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
// 		}
// 		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
// 			console.error('Shader program error:', gl.getProgramInfoLog(shaderProgram));
// 		}
// 	})
// 	.catch(error => console.error('Error loading GLB file:', error));