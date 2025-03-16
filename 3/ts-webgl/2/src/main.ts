import {Butterflies} from './Butterflies/Butterflies'
import {Clouds} from './Clouds/Clouds'
import {Grass} from './Grass/Grass'
import './index.css'
import {Meadow} from './Meadow/Meadow'
import {Moon} from './Moon/Moon'
import {Stars} from './Stars/Stars'
import {Sun} from './Sun/Sun'
import {createShaderProgram, computeOrthoMatrix, getWorldSize} from './Utils.ts'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private orthoMatrix: Float32Array
	private meadow: Meadow
	private grass: Grass
	private butterflies: Butterflies
	private sun: Sun
	private clouds: Clouds
	private moon: Moon
	private stars: Stars

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

		this.meadow = new Meadow(gl, this.program)
		this.grass = new Grass(gl, this.program)
		this.butterflies = new Butterflies(gl, this.program)
		this.sun = new Sun(gl, this.program, {x: width / 4, y: height / 2})
		this.clouds = new Clouds(gl, this.program)
		this.moon = new Moon(gl, this.program, {x: -width / 4, y: -height / 2})
		this.stars = new Stars(gl, this.program)

		window.addEventListener('resize', this.resizeCanvas)
	}

	render = () => {
		requestAnimationFrame(this.render)
		const gl = this.gl

		this.sun.update()
		this.clouds.update()
		this.butterflies.update()
		this.moon.update()
		this.stars.update()

		const skyColor = this.computeSkyColor(this.sun.getSunHeight())
		gl.clearColor(skyColor.r, skyColor.g, skyColor.b, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)

		const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		gl.uniformMatrix4fv(matrixLocation, false, this.orthoMatrix)

		this.stars.render()
		this.moon.render()
		this.sun.render()
		this.meadow.render()
		this.grass.render()
		this.clouds.render()
		this.butterflies.render()
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
