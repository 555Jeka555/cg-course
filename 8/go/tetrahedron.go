package main

import "math"

type Tetrahedron struct {
	Vertices [4]Vector // 4 вершины тетраэдра
	Faces    [4][3]int // Индексы вершин для каждой из 4 граней
	material Material
}

func NewTetrahedron(v0, v1, v2, v3 Vector, material Material) *Tetrahedron {
	t := &Tetrahedron{
		Vertices: [4]Vector{v0, v1, v2, v3},
		Faces: [4][3]int{
			{0, 1, 2}, // грань 1
			{0, 1, 3}, // грань 2
			{0, 2, 3}, // грань 3
			{1, 2, 3}, // грань 4
		},
		material: material,
	}
	return t
}

// Intersection проверяет пересечение луча с тетраэдром
func (t *Tetrahedron) Intersection(ray Ray) (IntersectionResult, bool) {
	closestIntersection := IntersectionResult{Distance: math.MaxFloat64}
	found := false

	// Проверяем пересечение с каждой гранью
	for _, face := range t.Faces {
		v0 := t.Vertices[face[0]]
		v1 := t.Vertices[face[1]]
		v2 := t.Vertices[face[2]]

		// Вычисляем нормаль грани
		edge1 := v1.Sub(v0)
		edge2 := v2.Sub(v0)
		normal := edge1.Cross(edge2).Normalize()

		// Проверяем пересечение луча с плоскостью грани
		denominator := ray.Direction.Dot(normal)
		if math.Abs(denominator) < 1e-6 {
			continue // луч параллелен плоскости
		}

		tPlane := v0.Sub(ray.Origin).Dot(normal) / denominator
		if tPlane < 0 {
			continue // пересечение за лучом
		}

		// Точка пересечения с плоскостью
		point := ray.Origin.Add(ray.Direction.Mul(tPlane))

		// Проверяем, находится ли точка внутри треугольника
		if pointInTriangle(point, v0, v1, v2) {
			if tPlane < closestIntersection.Distance {
				closestIntersection = IntersectionResult{
					Point:    point,
					Distance: tPlane,
					Object:   t,
				}
				found = true
			}
		}
	}

	return closestIntersection, found
}

// pointInTriangle проверяет, находится ли точка внутри треугольника
func pointInTriangle(p, v0, v1, v2 Vector) bool {
	// Метод барицентрических координат
	edge0 := v1.Sub(v0)
	edge1 := v2.Sub(v0)
	edge2 := p.Sub(v0)

	d00 := edge0.Dot(edge0)
	d01 := edge0.Dot(edge1)
	d11 := edge1.Dot(edge1)
	d20 := edge2.Dot(edge0)
	d21 := edge2.Dot(edge1)

	denom := d00*d11 - d01*d01
	if denom == 0 {
		return false
	}

	v := (d11*d20 - d01*d21) / denom
	w := (d00*d21 - d01*d20) / denom
	u := 1.0 - v - w

	return u >= 0 && v >= 0 && w >= 0
}

func (t *Tetrahedron) GetNormal(hitPosition Vector) Vector {
	// Находим ближайшую грань и возвращаем её нормаль
	closestFace := -1
	minDist := math.MaxFloat64

	for i, face := range t.Faces {
		v0 := t.Vertices[face[0]]
		v1 := t.Vertices[face[1]]
		v2 := t.Vertices[face[2]]
		edge1 := v1.Sub(v0)
		edge2 := v2.Sub(v0)
		normal := edge1.Cross(edge2).Normalize()

		// Расстояние от точки до плоскости грани
		dist := math.Abs(normal.Dot(hitPosition.Sub(v0)))
		if dist < minDist {
			minDist = dist
			closestFace = i
		}
	}

	if closestFace == -1 {
		return Vector{0, 1, 0} // fallback
	}

	// Вычисляем нормаль для ближайшей грани
	face := t.Faces[closestFace]
	v0 := t.Vertices[face[0]]
	v1 := t.Vertices[face[1]]
	v2 := t.Vertices[face[2]]
	edge1 := v1.Sub(v0)
	edge2 := v2.Sub(v0)
	return edge1.Cross(edge2).Normalize()
}

func (t *Tetrahedron) GetMaterial(_ Vector) Material {
	return t.material
}

// ApplyTransform применяет матричное преобразование к тетраэдру
func (t *Tetrahedron) ApplyTransform(transform Matrix4x4) {
	for i := range t.Vertices {
		t.Vertices[i] = transform.MulVector(t.Vertices[i])
	}
}
