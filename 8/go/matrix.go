package main

import "math"

type Matrix4x4 [4][4]float64

func Identity() Matrix4x4 {
	return Matrix4x4{
		{1, 0, 0, 0},
		{0, 1, 0, 0},
		{0, 0, 1, 0},
		{0, 0, 0, 1},
	}
}

func (m Matrix4x4) MulVector(v Vector) Vector {
	x := m[0][0]*v.X + m[0][1]*v.Y + m[0][2]*v.Z + m[0][3]
	y := m[1][0]*v.X + m[1][1]*v.Y + m[1][2]*v.Z + m[1][3]
	z := m[2][0]*v.X + m[2][1]*v.Y + m[2][2]*v.Z + m[2][3]
	return Vector{x, y, z}
}

func Translate(tx, ty, tz float64) Matrix4x4 {
	return Matrix4x4{
		{1, 0, 0, tx},
		{0, 1, 0, ty},
		{0, 0, 1, tz},
		{0, 0, 0, 1},
	}
}

func Scale(sx, sy, sz float64) Matrix4x4 {
	return Matrix4x4{
		{sx, 0, 0, 0},
		{0, sy, 0, 0},
		{0, 0, sz, 0},
		{0, 0, 0, 1},
	}
}

func RotateY(angle float64) Matrix4x4 {
	c := math.Cos(angle)
	s := math.Sin(angle)
	return Matrix4x4{
		{c, 0, s, 0},
		{0, 1, 0, 0},
		{-s, 0, c, 0},
		{0, 0, 0, 1},
	}
}

func (m Matrix4x4) Multiply(other Matrix4x4) Matrix4x4 {
	var result Matrix4x4
	for i := 0; i < 4; i++ {
		for j := 0; j < 4; j++ {
			result[i][j] = 0
			for k := 0; k < 4; k++ {
				result[i][j] += m[i][k] * other[k][j]
			}
		}
	}
	return result
}
