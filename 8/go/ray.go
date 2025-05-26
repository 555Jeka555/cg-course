package main

import (
	"fmt"
	"math"
)

type Ray struct {
	Origin    Vector
	Direction Vector
}

func NewRay(origin, direction Vector) Ray {
	return Ray{
		Origin:    origin,
		Direction: direction.Normalize(),
	}
}

func (r Ray) String() string {
	return fmt.Sprintf("Ray(origin: %v, direction: %v)", r.Origin, r.Direction)
}

func (r Ray) Cast(objects []SceneObject) (IntersectionResult, SceneObject, bool) {
	closestIntersection := IntersectionResult{Distance: math.MaxFloat64}
	var closestObject SceneObject
	found := false

	for _, obj := range objects {
		if intersection, hit := obj.Intersection(r); hit {
			if intersection.Distance < closestIntersection.Distance && intersection.Distance > 0 {
				closestIntersection = intersection
				closestObject = obj
				found = true
			}
		}
	}

	if found {
		return closestIntersection, closestObject, true
	}
	return IntersectionResult{}, nil, false
}
