package main

import "math"

// InfinityChessBoard реализует бесконечную шахматную доску
type InfinityChessBoard struct {
	Y        float64
	Color1   Vector
	Color2   Vector
	material Material
}

func NewInfinityChessBoard(y float64, color1, color2 Vector) *InfinityChessBoard {
	return &InfinityChessBoard{
		Y:      y,
		Color1: color1,
		Color2: color2,
		material: Material{
			AmbientColor:  Vector{0.5, 0.5, 0.0},
			DiffuseColor:  Vector{0.5, 0.5, 0.5},
			SpecularColor: Vector{0.5, 0.5, 0.5},
			Shininess:     0.5,
		},
	}
}

func (b *InfinityChessBoard) Intersection(ray Ray) (IntersectionResult, bool) {
	if ray.Direction.Y < 0 {
		return IntersectionResult{}, false
	}

	distance := b.Y - ray.Origin.Y
	point := ray.Origin.Add(ray.Direction.Mul(distance))
	return IntersectionResult{
		Point:    point,
		Distance: distance,
		Object:   b,
	}, true
}

func (b *InfinityChessBoard) GetNormal(hitPosition Vector) Vector {
	return Vector{0, -1, 0}
}

func (b *InfinityChessBoard) GetMaterial(hitPosition Vector) Material {
	// Используем math.Floor вместо math.Round для более consistent поведения
	x := math.Floor(hitPosition.X)
	z := math.Floor(hitPosition.Z)

	// Берём модуль с приведением к положительному значению
	xMod := math.Mod(math.Mod(x, 6)+6, 6)
	zMod := math.Mod(math.Mod(z, 6)+6, 6)

	// Клетка чёрная, если оба индекса в диапазоне [0,2] или оба в [3,5]
	if (xMod < 3 && zMod < 3) || (xMod >= 3 && zMod >= 3) {
		return b.material
	}
	return Material{
		DiffuseColor:  b.Color1,
		SpecularColor: b.Color1,
		AmbientColor:  b.Color1,
		Shininess:     0,
		Reflectivity:  0,
	}
}
