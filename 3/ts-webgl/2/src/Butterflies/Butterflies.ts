import {Renderable} from '../types'
import {getWorldSize} from '../Utils.ts'
import {Butterfly} from './Butterfly'

class Butterflies implements Renderable {
	private butterflies: Butterfly[] = []

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initButterflies()
	}

	render() {
		for (const b of this.butterflies) {
			b.render()
		}
	}

	update() {
		for (const b of this.butterflies) {
			b.update()
		}
	}

	private initButterflies() {
		const {width} = getWorldSize()

		for (let i = 0; i < 10; i++) {
			const x = Math.random() * width - width / 2
			const y = Math.random() * 3 - 1
			const targetX = Math.random() * width - width / 2
			const targetY = Math.random() * 3 - 1

			this.butterflies.push(new Butterfly(
				this.gl,
				this.program,
				{
					position: {x, y},
					target: {x: targetX, y: targetY},
					color: {r: Math.random(), g: Math.random(), b: Math.random(), a: 1},
				},
			))
		}

	}
}

export {
	Butterflies,
}