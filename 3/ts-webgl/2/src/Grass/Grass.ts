import {Renderable} from '../types'
import {getWorldSize} from '../Utils.ts'
import {GrassBlade} from './GrassBlade'

class Grass implements Renderable {
	private grassBlades: GrassBlade[] = []

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initGrass()
	}

	render() {
		for (const grassBlade of this.grassBlades) {
			grassBlade.render()
		}
	}

	update() {
		for (const grassBlade of this.grassBlades) {
			grassBlade.update()
		}
	}

	private initGrass() {
		const {width} = getWorldSize()

		for (let i = 0; i < 100; i++) {
			const x = Math.random() * width - width / 2
			const y = -1 + Math.random()
			const bladeWidth = 0.1 + Math.random() * 0.1
			const bladeHeight = 0.2 + Math.random() * 0.3
			this.grassBlades.push(
				new GrassBlade(
					this.gl,
					this.program,
					{
						firstAngle: {x, y},
						secondAngle: {x: x + bladeWidth, y},
						thirdAngle: {x: x + bladeWidth / 2, y: y + bladeHeight},
					},
				),
			)
		}
	}
}

export {
	Grass,
}