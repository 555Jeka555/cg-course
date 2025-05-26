package main

import (
	"fmt"
	"math"
)

// SceneObject определяет общий интерфейс для всех объектов сцены
type SceneObject interface {
	Intersection(ray Ray) (IntersectionResult, bool) // Проверка пересечения с лучом
	GetNormal(hitPosition Vector) Vector             // Получение нормали в точке
	GetMaterial(hitPosition Vector) Material         // Получение материала объекта
	String() string                                  // Строковое представление
}

// IntersectionResult содержит полную информацию о пересечении
type IntersectionResult struct {
	Point    Vector      // Точка пересечения
	Distance float64     // Расстояние от начала луча
	Object   SceneObject // Ссылка на объект
}

// Material содержит свойства материала объекта
type Material struct {
	DiffuseColor  Vector
	SpecularColor Vector
	AmbientColor  Vector
	Shininess     float64
	Reflectivity  float64 // Добавим коэффициент отражения
}

// Sphere реализует сферу как объект сцены
type Sphere struct {
	Center   Vector
	Radius   float64
	material Material
}

func NewSphere(center Vector, radius float64, material Material) *Sphere {
	return &Sphere{
		Center:   center,
		Radius:   radius,
		material: material,
	}
}

func (s *Sphere) Intersection(ray Ray) (IntersectionResult, bool) {
	l := s.Center.Sub(ray.Origin)
	adj := l.Dot(ray.Direction)
	d2 := l.Dot(l) - (adj * adj)
	radius2 := s.Radius * s.Radius

	if d2 > radius2 {
		return IntersectionResult{}, false
	}

	thc := math.Sqrt(radius2 - d2)
	t0 := adj - thc
	t1 := adj + thc

	if t0 < 0 && t1 < 0 {
		return IntersectionResult{}, false
	}

	distance := t0
	if t1 < t0 && t1 > 0 {
		distance = t1
	} else if t0 < 0 {
		distance = t1
	}

	point := ray.Origin.Add(ray.Direction.Mul(distance))
	return IntersectionResult{
		Point:    point,
		Distance: distance,
		Object:   s,
	}, true
}

func (s *Sphere) GetNormal(hitPosition Vector) Vector {
	return hitPosition.Sub(s.Center).Normalize()
}

func (s *Sphere) GetMaterial(hitPosition Vector) Material {
	return s.material
}

func (s *Sphere) String() string {
	return fmt.Sprintf("Sphere(center: %v, radius: %.2f)", s.Center, s.Radius)
}

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

func (b *InfinityChessBoard) String() string {
	return fmt.Sprintf("Checkerboard(y: %.2f)", b.Y)
}

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

func (c *Cube) String() string {
	return fmt.Sprintf("Cube(center: %v, size: %.2f)", c.Center, c.Size)
}

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

func (t *Torus) String() string {
	return fmt.Sprintf("Torus(R=%.2f, r=%.2f)", t.MajorRadius, t.MinorRadius)
}

// Tetrahedron реализует тетраэдр как объект сцены
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

func (t *Tetrahedron) GetMaterial(hitPosition Vector) Material {
	return t.material
}

func (t *Tetrahedron) String() string {
	return fmt.Sprintf("Tetrahedron(v0: %v, v1: %v, v2: %v, v3: %v)",
		t.Vertices[0], t.Vertices[1], t.Vertices[2], t.Vertices[3])
}

// ApplyTransform применяет матричное преобразование к тетраэдру
func (t *Tetrahedron) ApplyTransform(transform Matrix4x4) {
	for i := range t.Vertices {
		t.Vertices[i] = transform.MulVector(t.Vertices[i])
	}
}
