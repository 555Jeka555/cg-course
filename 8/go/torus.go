package main

import "math"

// Torus представляет стандартный тор (бублик)
type Torus struct {
	MajorRadius float64 // Расстояние от центра тора до центра "трубы"
	MinorRadius float64 // Радиус самой "трубы"
	material    Material
}

func NewTorus(majorRadius, minorRadius float64, material Material) *Torus {
	return &Torus{
		MajorRadius: majorRadius,
		MinorRadius: minorRadius,
		material:    material,
	}
}

// Функция, вычисляющая расстояние от точки до поверхности тора (signed distance function)
func (t *Torus) distanceFunction(p Vector) float64 {
	xzPlane := math.Sqrt(p.X*p.X + p.Z*p.Z)
	return math.Sqrt((xzPlane-t.MajorRadius)*(xzPlane-t.MajorRadius)+(p.Y)*(p.Y)) - t.MinorRadius
}

// Упрощённый поиск пересечения луча с тором (метод секущих)
func (t *Torus) Intersection(ray Ray) (IntersectionResult, bool) {
	const maxSteps = 10000
	const epsilon = 1e-2

	var tNear, tFar float64 = 0, 100 // Диапазон поиска пересечений

	// Ищем пересечение методом секущих (упрощённый ray marching)
	tCurrent := tNear
	step := (tFar - tNear) / float64(maxSteps)

	for i := 0; i < maxSteps; i++ {
		point := ray.Origin.Add(ray.Direction.Mul(tCurrent))
		distance := t.distanceFunction(point)

		if math.Abs(distance) < epsilon {
			return IntersectionResult{
				Point:    point,
				Distance: tCurrent,
				Object:   t,
			}, true
		}

		// Корректируем шаг
		tCurrent += step * 0.5 // Уменьшаем шаг для точности
	}

	return IntersectionResult{}, false
}

// Нормаль к поверхности тора (чецентральные разности)
func (t *Torus) GetNormal(p Vector) Vector {
	const delta = 1e-4

	// Вычисляем градиент distanceFunction
	dx := t.distanceFunction(Vector{p.X + delta, p.Y, p.Z}) - t.distanceFunction(Vector{p.X - delta, p.Y, p.Z})
	dy := t.distanceFunction(Vector{p.X, p.Y + delta, p.Z}) - t.distanceFunction(Vector{p.X, p.Y - delta, p.Z})
	dz := t.distanceFunction(Vector{p.X, p.Y, p.Z + delta}) - t.distanceFunction(Vector{p.X, p.Y, p.Z - delta})

	normal := Vector{dx, dy, dz}
	return normal.Normalize()
}

func (t *Torus) GetMaterial(p Vector) Material {
	return t.material
}
