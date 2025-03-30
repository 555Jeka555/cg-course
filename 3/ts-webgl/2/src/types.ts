type Size = {
	width: number,
	height: number,
}

type Renderable = {
	render: () => void,
}

export type {
	Renderable,
	Size,
}