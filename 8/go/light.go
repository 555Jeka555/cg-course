package main

import "fmt"

type DirectionalLight struct {
	Direction     Vector
	Strength      float64
	DiffuseColor  Vector
	SpecularColor Vector
	AmbientColor  Vector
}

func NewLight(direction Vector, strength float64, diffuse, specular, ambient Vector) DirectionalLight {
	return DirectionalLight{
		Direction:     direction.Normalize(),
		Strength:      strength,
		DiffuseColor:  diffuse,
		SpecularColor: specular,
		AmbientColor:  ambient,
	}
}

func (l DirectionalLight) String() string {
	return fmt.Sprintf("DirectionalLight(direction: %v, strength: %.2f)", l.Direction, l.Strength)
}

func (l DirectionalLight) GetDirectionToLight(hitPoint Vector) Vector {
	return l.Direction.Neg()
}

func (l DirectionalLight) GetIntensity(hitPoint Vector) float64 {
	return l.Strength
}
