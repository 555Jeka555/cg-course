package main

import (
	"math"
)

// Cube реализует куб как объект сцены
type Cube struct {
	Center   Vector
	Size     float64
	material Material
}

func NewCube(center Vector, size float64, material Material) *Cube {
	return &Cube{
		Center:   center,
		Size:     size,
		material: material,
	}
}

func (c *Cube) Intersection(ray Ray) (IntersectionResult, bool) {
	min := c.Center.Sub(Vector{c.Size / 2, c.Size / 2, c.Size / 2})
	max := c.Center.Add(Vector{c.Size / 2, c.Size / 2, c.Size / 2})

	tmin := (min.X - ray.Origin.X) / ray.Direction.X
	tmax := (max.X - ray.Origin.X) / ray.Direction.X

	if tmin > tmax {
		tmin, tmax = tmax, tmin
	}

	tymin := (min.Y - ray.Origin.Y) / ray.Direction.Y
	tymax := (max.Y - ray.Origin.Y) / ray.Direction.Y

	if tymin > tymax {
		tymin, tymax = tymax, tymin
	}

	if (tmin > tymax) || (tymin > tmax) {
		return IntersectionResult{}, false
	}

	if tymin > tmin {
		tmin = tymin
	}

	if tymax < tmax {
		tmax = tymax
	}

	tzmin := (min.Z - ray.Origin.Z) / ray.Direction.Z
	tzmax := (max.Z - ray.Origin.Z) / ray.Direction.Z

	if tzmin > tzmax {
		tzmin, tzmax = tzmax, tzmin
	}

	if (tmin > tzmax) || (tzmin > tmax) {
		return IntersectionResult{}, false
	}

	if tzmin > tmin {
		tmin = tzmin
	}

	if tzmax < tmax {
		tmax = tzmax
	}

	// Выбираем ближайшее пересечение
	var distance float64
	if tmin < 0 {
		if tmax < 0 {
			return IntersectionResult{}, false
		}
		distance = tmax
	} else {
		distance = tmin
	}

	point := ray.Origin.Add(ray.Direction.Mul(distance))
	return IntersectionResult{
		Point:    point,
		Distance: distance,
		Object:   c,
	}, true
}

func (c *Cube) GetNormal(hitPosition Vector) Vector {
	// Находим ближайшую грань куба
	min := c.Center.Sub(Vector{c.Size / 2, c.Size / 2, c.Size / 2})
	max := c.Center.Add(Vector{c.Size / 2, c.Size / 2, c.Size / 2})

	// Определяем, какая грань ближе всего к точке пересечения
	epsilon := 0.0001
	if math.Abs(hitPosition.X-min.X) < epsilon {
		return Vector{-1, 0, 0} // Левая грань
	} else if math.Abs(hitPosition.X-max.X) < epsilon {
		return Vector{1, 0, 0} // Правая грань
	} else if math.Abs(hitPosition.Y-min.Y) < epsilon {
		return Vector{0, -1, 0} // Нижняя грань
	} else if math.Abs(hitPosition.Y-max.Y) < epsilon {
		return Vector{0, 1, 0} // Верхняя грань
	} else if math.Abs(hitPosition.Z-min.Z) < epsilon {
		return Vector{0, 0, -1} // Передняя грань
	} else {
		return Vector{0, 0, 1} // Задняя грань
	}
}

func (c *Cube) GetMaterial(hitPosition Vector) Material {
	return c.material
}
