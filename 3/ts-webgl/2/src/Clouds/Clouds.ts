import {Renderable} from '../types'
import {getWorldSize} from '../Utils.ts'
import {Cloud} from './Cloud'

class Clouds implements Renderable {
	private clouds: Cloud[] = []

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initClouds()
	}

	update() {
		for (const cloud of this.clouds) {
			cloud.update()
		}
	}

	render() {
		for (const cloud of this.clouds) {
			cloud.render()
		}
	}

	private initClouds() {
		const {width} = getWorldSize()
		for (let i = 0; i < 7; i++) {
			const x = Math.random() * width - width / 2
			const y = 5 + Math.random() * 2
			const speed = 0.005 + Math.random() * 0.008

			this.clouds.push(new Cloud(this.gl, this.program, {
				position: {x, y},
				speed,
			}))
		}
	}
}

export {
	Clouds,
}
