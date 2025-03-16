type Position = {
	x: number,
	y: number,
}

type Size = {
	width: number,
	height: number,
}

type Color = {
	r: number,
	g: number,
	b: number,
	a: number,
}

type Renderable = {
	render: () => void,
	update: () => void,
}

export type {
	Position,
	Color,
	Renderable,
	Size,
}