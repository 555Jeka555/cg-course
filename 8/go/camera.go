package main

import (
	"fmt"
	"math"
	"math/rand"
)

type Camera struct {
	Position      Vector
	ScreenSize    Vector
	FOV           float64
	FocusDistance float64
	Aperture      float64
}

func NewCamera(position, screenSize Vector, fov float64, focusDistance float64, aperture float64) Camera {
	return Camera{
		Position:      position,
		ScreenSize:    screenSize,
		FOV:           fov,
		FocusDistance: focusDistance,
		Aperture:      aperture,
	}
}

func (c Camera) String() string {
	return fmt.Sprintf("Camera(position: %v, screen_size: %v, fov: %.1f, focus_distance: %.1f, aperture: %.2f)",
		c.Position, c.ScreenSize, c.FOV, c.FocusDistance, c.Aperture)
}

func (c Camera) GetDirection(xy Vector) Ray {
	// Original direction calculation
	adjustedXY := xy.Sub(c.ScreenSize.Div(Vector{2, 2, 2}))
	z := c.ScreenSize.Y / math.Tan(degreesToRadians(c.FOV)/2)
	direction := Vector{adjustedXY.X, adjustedXY.Y, -z}.Normalize()

	var origin Vector
	var finalDirection Vector

	// Depth of field simulation
	if c.Aperture > 0 {
		// Random point within aperture
		theta := rand.Float64() * 2 * math.Pi
		r := rand.Float64() * c.Aperture / 2
		rd := Vector{r * math.Cos(theta), r * math.Sin(theta), 0}

		focalPoint := c.Position.Add(direction.Mul(c.FocusDistance))
		finalDirection = focalPoint.Sub(c.Position.Add(rd)).Normalize()
		origin = c.Position.Add(rd)
	} else {
		finalDirection = direction
		origin = c.Position
	}

	return NewRay(origin, finalDirection)
}

func degreesToRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}
