package main

import "math"

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

func (s *Sphere) GetMaterial(_ Vector) Material {
	return s.material
}
