package main

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"math"
	"os"
)

type Skybox struct {
	path string
	img  image.Image
	size image.Point
}

func NewSkybox(path string) (*Skybox, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open skybox image: %w", err)
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("failed to decode skybox image: %w", err)
	}

	bounds := img.Bounds()
	return &Skybox{
		path: path,
		img:  img,
		size: image.Point{bounds.Dx(), bounds.Dy()},
	}, nil
}

func (s *Skybox) GetImageCoords(normal Vector) Vector {
	u := 0.5 + math.Atan2(normal.Z, normal.X)/(2*math.Pi)
	v := 0.5 + math.Asin(normal.Y)/math.Pi

	x := int(u * float64(s.size.X))
	y := int(v * float64(s.size.Y))

	x = clamp(x, 0, s.size.X-1)
	y = clamp(y, 0, s.size.Y-1)

	r, g, b, _ := s.img.At(x, y).RGBA()
	return Vector{
		float64(r) / 65535.0,
		float64(g) / 65535.0,
		float64(b) / 65535.0,
	}
}

func clamp(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}
