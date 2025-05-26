package main

import (
	"fmt"
	"math"
)

type Vector struct {
	X, Y, Z float64
}

func NewVector(x, y, z float64) Vector {
	return Vector{x, y, z}
}

func (v Vector) String() string {
	return fmt.Sprintf("Vector(x: %.2f, y: %.2f, z: %.2f)", v.X, v.Y, v.Z)
}

func (v Vector) Add(other interface{}) Vector {
	switch o := other.(type) {
	case float64:
		return Vector{v.X + o, v.Y + o, v.Z + o}
	case int:
		return v.Add(float64(o))
	case Vector:
		return Vector{v.X + o.X, v.Y + o.Y, v.Z + o.Z}
	default:
		fmt.Println("Adding a vector with an unsupported variable type!")
		return v
	}
}

func (v Vector) Sub(other interface{}) Vector {
	switch o := other.(type) {
	case float64:
		return Vector{v.X - o, v.Y - o, v.Z - o}
	case int:
		return v.Sub(float64(o))
	case Vector:
		return Vector{v.X - o.X, v.Y - o.Y, v.Z - o.Z}
	default:
		fmt.Println("Subtracting a vector with an unsupported variable type!", o)
		return v
	}
}

func (v Vector) Mul(other interface{}) Vector {
	switch o := other.(type) {
	case float64:
		return Vector{v.X * o, v.Y * o, v.Z * o}
	case int:
		return v.Mul(float64(o))
	case Vector:
		return Vector{v.X * o.X, v.Y * o.Y, v.Z * o.Z}
	default:
		fmt.Println("Multiplying a vector with an unsupported variable type!")
		return v
	}
}

func (v Vector) Div(other interface{}) Vector {
	smallValue := 0.00000001
	switch o := other.(type) {
	case float64:
		denominator := o + smallValue
		return Vector{v.X / denominator, v.Y / denominator, v.Z / denominator}
	case int:
		return v.Div(float64(o))
	case Vector:
		return Vector{
			v.X / (o.X + smallValue),
			v.Y / (o.Y + smallValue),
			v.Z / (o.Z + smallValue),
		}
	default:
		fmt.Println("Dividing a vector with an unsupported variable type!")
		return v
	}
}

func (v Vector) Pow(exponent interface{}) Vector {
	switch e := exponent.(type) {
	case float64:
		return Vector{math.Pow(v.X, e), math.Pow(v.Y, e), math.Pow(v.Z, e)}
	case int:
		return v.Pow(float64(e))
	case Vector:
		return Vector{
			math.Pow(v.X, e.X),
			math.Pow(v.Y, e.Y),
			math.Pow(v.Z, e.Z),
		}
	default:
		fmt.Println("Powering a vector with an unsupported variable type!")
		return v
	}
}

func (v Vector) Magnitude() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
}

func (v Vector) Dot(other interface{}) float64 {
	switch o := other.(type) {
	case float64:
		return v.X*o + v.Y*o + v.Z*o
	case int:
		return v.Dot(float64(o))
	case Vector:
		return v.X*o.X + v.Y*o.Y + v.Z*o.Z
	default:
		fmt.Println("Dot product with an unsupported variable type!")
		return 0
	}
}

func (v Vector) Cross(o Vector) Vector {
	return Vector{
		v.Y*o.Z - v.Z*o.Y,
		v.Z*o.X - v.X*o.Z,
		v.X*o.Y - v.Y*o.X,
	}
}

func (v Vector) Normalize() Vector {
	return v.Div(v.Magnitude())
}

func (v Vector) Reflect(normal Vector) Vector {
	return v.Sub(normal.Mul(v.Dot(normal) * 2))
}

func (v Vector) ToRGB() (float64, float64, float64) {
	r := v.X
	g := v.Y
	b := v.Z

	r = math.Max(0, math.Min(1, r))
	g = math.Max(0, math.Min(1, g))
	b = math.Max(0, math.Min(1, b))

	return r * 255, g * 255, b * 255
}

// Comparison methods
func (v Vector) GreaterThan(other interface{}) bool {
	switch o := other.(type) {
	case float64:
		return v.Magnitude() > o
	case int:
		return v.GreaterThan(float64(o))
	case Vector:
		return v.Magnitude() > o.Magnitude()
	default:
		fmt.Println("Comparing a vector with an unsupported variable type!")
		return false
	}
}

func (v Vector) LessThan(other interface{}) bool {
	switch o := other.(type) {
	case float64:
		return v.Magnitude() < o
	case int:
		return v.LessThan(float64(o))
	case Vector:
		return v.Magnitude() < o.Magnitude()
	default:
		fmt.Println("Comparing a vector with an unsupported variable type!")
		return false
	}
}

func (v Vector) GreaterThanOrEqual(other interface{}) bool {
	switch o := other.(type) {
	case float64:
		return v.Magnitude() >= o
	case int:
		return v.GreaterThanOrEqual(float64(o))
	case Vector:
		return v.Magnitude() >= o.Magnitude()
	default:
		fmt.Println("Comparing a vector with an unsupported variable type!")
		return false
	}
}

func (v Vector) LessThanOrEqual(other interface{}) bool {
	switch o := other.(type) {
	case float64:
		return v.Magnitude() <= o
	case int:
		return v.LessThanOrEqual(float64(o))
	case Vector:
		return v.Magnitude() <= o.Magnitude()
	default:
		fmt.Println("Comparing a vector with an unsupported variable type!")
		return false
	}
}

func (v Vector) Equal(other interface{}) bool {
	switch o := other.(type) {
	case float64:
		return v.Magnitude() == o
	case int:
		return v.Equal(float64(o))
	case Vector:
		return v.Magnitude() == o.Magnitude()
	default:
		fmt.Println("Comparing a vector with an unsupported variable type!")
		return false
	}
}

func (v Vector) Neg() Vector {
	return Vector{-v.X, -v.Y, -v.Z}
}

func (v Vector) Pos() Vector {
	return Vector{+v.X, +v.Y, +v.Z}
}

func (v Vector) Float() float64 {
	return v.Magnitude()
}

func (v Vector) Int() int {
	return int(v.Magnitude())
}

func (v Vector) Get(i int) float64 {
	if i == 0 {
		return v.X
	}
	if i == 1 {
		return v.Y
	}
	if i == 2 {
		return v.X
	}
	return 0
}

func (v Vector) Set(i int, f float64) {
	if i == 0 {
		v.X = f
	}
	if i == 1 {
		v.Y = f
	}
	if i == 2 {
		v.Z = f
	}
}
