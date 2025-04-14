import {DeltoidalIcositetrahedron} from './DeltoidalIcositetrahedron/DeltoidalIcositetrahedron'
import {Settings} from './Settings/Settings'
import {createShaderProgram} from './WebGLUtils'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private deltoidalIcositetrahedron: DeltoidalIcositetrahedron

	private isMouseDown = false
	private lastMouseX = 0
	private lastMouseY = 0
	private cameraRotationX = 0
	private cameraRotationY = 0

	private lightIntensity = 1

	constructor() {
		const settings = new Settings(intensity => {
			this.lightIntensity = intensity
		})
		document.querySelector('#root')?.appendChild(settings.getElement())

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
		this.deltoidalIcositetrahedron = new DeltoidalIcositetrahedron(gl, this.program)

		window.addEventListener('resize', this.resizeCanvas)

		this.canvas.addEventListener('mousedown', this.onMouseDown)
		this.canvas.addEventListener('mousemove', this.onMouseMove)
		this.canvas.addEventListener('mouseup', this.onMouseUp)
		this.canvas.addEventListener('mouseleave', this.onMouseUp)
	}

	render = () => {
		this.deltoidalIcositetrahedron.render(this.cameraRotationX, this.cameraRotationY, this.lightIntensity)
		requestAnimationFrame(this.render)
	}

	private resizeCanvas = () => {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
	}

	private onMouseDown = (event: MouseEvent) => {
		this.isMouseDown = true
		this.lastMouseX = event.clientX
		this.lastMouseY = event.clientY
	}

	private onMouseMove = (event: MouseEvent) => {
		if (!this.isMouseDown) {
			return
		}

		const deltaX = event.clientX - this.lastMouseX
		const deltaY = event.clientY - this.lastMouseY
		this.lastMouseX = event.clientX
		this.lastMouseY = event.clientY

		const sensitivity = 0.001
		this.cameraRotationY -= deltaX * sensitivity
		this.cameraRotationX += deltaY * sensitivity

		const maxPitch = Math.PI / 2 - 0.01
		const minPitch = -maxPitch
		this.cameraRotationX = Math.max(minPitch, Math.min(maxPitch, this.cameraRotationX))
	}


	private onMouseUp = () => {
		this.isMouseDown = false
	}
}

const app = new App()
requestAnimationFrame(app.render)