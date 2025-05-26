package main

type SceneObject interface {
	Intersection(ray Ray) (IntersectionResult, bool)
	GetNormal(hitPosition Vector) Vector
	GetMaterial(hitPosition Vector) Material
}

type IntersectionResult struct {
	Point    Vector
	Distance float64
	Object   SceneObject
}

type Material struct {
	DiffuseColor  Vector
	SpecularColor Vector
	AmbientColor  Vector
	Shininess     float64
	Reflectivity  float64
}
