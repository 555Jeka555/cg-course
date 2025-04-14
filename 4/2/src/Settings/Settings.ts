class Settings {
	constructor(
		private readonly onLightIntensityChange: (lightIntensity: number) => void,
	) {
	}

	getElement(): HTMLElement {
		const outerBlock = document.createElement('div')
		outerBlock.id = 'outer-block'
		outerBlock.style.position = 'absolute'
		outerBlock.style.top = '2%'
		outerBlock.style.right = '2%'
		outerBlock.style.width = '300px'
		outerBlock.style.height = '200px'

		const innerBlock = document.createElement('div')
		innerBlock.id = 'inner-block'
		innerBlock.style.display = 'flex'
		innerBlock.style.justifyContent = 'space-between'
		innerBlock.style.textAlign = 'center'

		const slider = document.createElement('input')
		slider.style.width = '80%'
		slider.style.height = '20px'
		slider.style.margin = '20px auto'
		slider.type = 'range'
		slider.min = '0'
		slider.max = '150'
		slider.value = '100'
		slider.className = 'slider'

		slider.addEventListener('input', e => {
			const target = e.target as HTMLInputElement
			this.onLightIntensityChange(Number(target.value) / 100)
		})

		const text = document.createElement('div')
		text.innerText = 'Интенсивность света'

		innerBlock.appendChild(slider)
		innerBlock.appendChild(text)
		outerBlock.appendChild(innerBlock)

		return outerBlock
	}
}

export {
	Settings,
}