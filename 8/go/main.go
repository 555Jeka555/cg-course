package main

import (
	"image"
	"image/color"
	"image/png"
	"log"
	"math"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
	"github.com/sqweek/dialog"
)

const (
	screenWidth     = 1600
	screenHeight    = 600
	shadowBias      = 0.0001
	maxReflections  = 3
	samplesPerPixel = 2
	lineForGorutine = 80
)

var (
	objects        []SceneObject
	light          DirectionalLight
	camera         Camera
	img            *image.RGBA
	saveKeyPressed bool
	skybox, _      = NewSkybox("skubox.jpeg")
)

// Matrix4x4 представляет 4x4 матрицу для преобразований
type Matrix4x4 [4][4]float64

// Identity возвращает единичную матрицу
func Identity() Matrix4x4 {
	return Matrix4x4{
		{1, 0, 0, 0},
		{0, 1, 0, 0},
		{0, 0, 1, 0},
		{0, 0, 0, 1},
	}
}

// MulVector умножает матрицу на вектор
func (m Matrix4x4) MulVector(v Vector) Vector {
	x := m[0][0]*v.X + m[0][1]*v.Y + m[0][2]*v.Z + m[0][3]
	y := m[1][0]*v.X + m[1][1]*v.Y + m[1][2]*v.Z + m[1][3]
	z := m[2][0]*v.X + m[2][1]*v.Y + m[2][2]*v.Z + m[2][3]
	return Vector{x, y, z}
}

// Translate создает матрицу перемещения
func Translate(tx, ty, tz float64) Matrix4x4 {
	return Matrix4x4{
		{1, 0, 0, tx},
		{0, 1, 0, ty},
		{0, 0, 1, tz},
		{0, 0, 0, 1},
	}
}

// Scale создает матрицу масштабирования
func Scale(sx, sy, sz float64) Matrix4x4 {
	return Matrix4x4{
		{sx, 0, 0, 0},
		{0, sy, 0, 0},
		{0, 0, sz, 0},
		{0, 0, 0, 1},
	}
}

// RotateX создает матрицу поворота вокруг оси X
func RotateX(angle float64) Matrix4x4 {
	c := math.Cos(angle)
	s := math.Sin(angle)
	return Matrix4x4{
		{1, 0, 0, 0},
		{0, c, -s, 0},
		{0, s, c, 0},
		{0, 0, 0, 1},
	}
}

// RotateY создает матрицу поворота вокруг оси Y
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

// RotateZ создает матрицу поворота вокруг оси Z
func RotateZ(angle float64) Matrix4x4 {
	c := math.Cos(angle)
	s := math.Sin(angle)
	return Matrix4x4{
		{c, -s, 0, 0},
		{s, c, 0, 0},
		{0, 0, 1, 0},
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

func initScene() {
	camera = NewCamera(
		Vector{0, 0, 10},
		Vector{float64(screenWidth), float64(screenHeight), 0},
		60,
		15.0,
		0.5,
	)

	// Создание куба в сцене
	cubeMaterial := Material{
		DiffuseColor:  Vector{0.8, 0.5, 0.2},
		SpecularColor: Vector{0.5, 0.5, 0.5},
		AmbientColor:  Vector{0.1, 0.1, 0.1},
		Shininess:     20,
		Reflectivity:  0.3,
	}
	cube := NewCube(Vector{-7, -2, -10}, 2.0, cubeMaterial)

	torus := NewTorus(1.0, 0.3, Material{
		DiffuseColor:  Vector{0.7, 0.7, 0.2},
		SpecularColor: Vector{0.5, 0.5, 0.5},
		AmbientColor:  Vector{0.1, 0.1, 0.1},
		Shininess:     20,
		Reflectivity:  0.3,
	})

	tetrahedronMaterial := Material{
		DiffuseColor:  Vector{0.1, 0.1, 0.9},
		SpecularColor: Vector{0.5, 0.5, 0.5},
		AmbientColor:  Vector{0.1, 0.1, 0.1},
		Shininess:     20,
		Reflectivity:  0.3,
	}

	// Базовые вершины тетраэдра
	tetrahedron := NewTetrahedron(
		Vector{3, -2, -10},
		Vector{5, -2, -10},
		Vector{4, 0, -10},
		Vector{4, -2, -8},
		tetrahedronMaterial,
	)

	transform := Identity().
		Multiply(Translate(-5, -1, 5)).
		Multiply(RotateY(math.Pi / 4)).
		Multiply(Scale(1.5, 1.5, 1.5))

	tetrahedron.ApplyTransform(transform)

	objects = []SceneObject{
		cube,
		tetrahedron,
		torus,
		NewInfinityChessBoard(
			2,
			Vector{0, 0, 0},
			Vector{1, 1, 1},
		),
		NewSphere(
			Vector{0, -2, -15}, 2,
			Material{
				DiffuseColor:  Vector{1, 1, 0},
				SpecularColor: Vector{1, 1, 1},
				AmbientColor:  Vector{0.1, 0.1, 0.1},
				Shininess:     32,
			},
		),
	}

	light = NewLight(
		Vector{0, 1, -1},
		1.0,
		Vector{1, 1, 1},
		Vector{1, 1, 1},
		Vector{0.2, 0.2, 0.2},
	)
}

func multiplyColors(a, b Vector) Vector {
	return Vector{a.X * b.X, a.Y * b.Y, a.Z * b.Z}
}

func addColors(a, b Vector) Vector {
	return Vector{a.X + b.X, a.Y + b.Y, a.Z + b.Z}
}

func traceRay(ray Ray) (Vector, *Vector, SceneObject, Vector) {
	color := Vector{0, 0, 0}
	var normal Vector
	var intersect *Vector
	var obj SceneObject

	point, obj, hit := ray.Cast(objects)
	if hit {
		intersect = &point.Point
		normal = obj.GetNormal(point.Point)
		material := obj.GetMaterial(point.Point)

		// Ambient component (always present)
		ambient := multiplyColors(material.AmbientColor, light.AmbientColor)

		// Initialize diffuse and specular components to zero
		diffuse := Vector{0, 0, 0}
		specular := Vector{0, 0, 0}

		// Check if point is in shadow
		lightDir := light.Direction.Neg().Normalize()
		shadowRay := Ray{Origin: point.Point.Add(lightDir.Mul(0.001)), Direction: lightDir}
		_, _, shadowHit := shadowRay.Cast(objects)

		if !shadowHit {
			// Diffuse component (only if not in shadow)
			diffuseIntensity := math.Max(0, normal.Dot(lightDir)) * light.Strength
			diffuse = multiplyColors(material.DiffuseColor, light.DiffuseColor).Mul(diffuseIntensity)

			// Specular component (only if not in shadow)
			viewDir := camera.Position.Sub(point.Point).Normalize()
			reflectDir := normal.Mul(2 * normal.Dot(lightDir)).Sub(lightDir)
			specularIntensity := math.Pow(math.Max(0, viewDir.Dot(reflectDir)), material.Shininess)
			specular = multiplyColors(material.SpecularColor, light.SpecularColor).Mul(specularIntensity)
		}

		// Combine all components
		color = addColors(ambient, addColors(diffuse, specular))
	} else {
		color = skybox.GetImageCoords(ray.Direction)
	}

	return color, intersect, obj, normal
}

type Game struct {
	rendered bool
}

func (g *Game) Update() error {
	if !g.rendered {
		go renderScene()
		g.rendered = true
	}

	// Обработка нажатия клавиши S для сохранения
	if ebiten.IsKeyPressed(ebiten.KeyS) && !saveKeyPressed {
		saveKeyPressed = true
		go func() {
			saveImageWithDialog()
			saveKeyPressed = false
		}()
	} else if !ebiten.IsKeyPressed(ebiten.KeyS) {
		saveKeyPressed = false
	}

	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	if img != nil {
		screen.ReplacePixels(img.Pix)
	}
	ebitenutil.DebugPrint(screen, "Go Raytracer - Progressive Rendering")
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return screenWidth, screenHeight
}

func saveImageWithDialog() {
	if img == nil {
		return
	}

	// Открываем диалоговое окно для выбора файла
	filename, err := dialog.File().
		Title("Save Image").
		Filter("PNG Image", "png").
		SetStartDir(".").
		Save()

	if err != nil {
		if err != dialog.ErrCancelled {
			log.Printf("Failed to open save dialog: %v", err)
		}
		return
	}

	// Добавляем расширение .png, если его нет
	if !strings.HasSuffix(strings.ToLower(filename), ".png") {
		filename += ".png"
	}

	// Создаем директорию, если она не существует
	dir := filepath.Dir(filename)
	if dir != "" {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Failed to create directory: %v", err)
			return
		}
	}

	// Создаем файл
	file, err := os.Create(filename)
	if err != nil {
		log.Printf("Failed to create file: %v", err)
		return
	}
	defer file.Close()

	// Сохраняем изображение
	if err := png.Encode(file, img); err != nil {
		log.Printf("Failed to encode PNG: %v", err)
		return
	}

	log.Printf("Image successfully saved to %s", filename)
}

func renderScene() {
	rand.Seed(time.Now().UnixNano())
	img = image.NewRGBA(image.Rect(0, 0, screenWidth, screenHeight))

	for i := 0; i < screenHeight/lineForGorutine; i++ {
		i := i
		go func() {
			for y := i * lineForGorutine; y < (i+1)*lineForGorutine; y++ {
				for x := 0; x < screenWidth; x++ {
					colorSum := Vector{0, 0, 0}

					for s := 0; s < samplesPerPixel; s++ {
						jx := float64(x) + rand.Float64() - 0.5
						jy := float64(y) + rand.Float64() - 0.5

						ray := camera.GetDirection(Vector{jx, jy, 0})
						color, intersect, _, normal := traceRay(ray)

						if intersect != nil {
							// Обработка отражений
							reflectionDir := ray.Direction.Reflect(normal)
							reflectionRay := Ray{
								Origin:    intersect.Add(reflectionDir.Mul(shadowBias)),
								Direction: reflectionDir,
							}

							reflectionColor := Vector{0, 0, 0}
							reflectionTimes := 0

							for r := 0; r < maxReflections; r++ {
								newColor, newIntersect, _, newNormal := traceRay(reflectionRay)
								if newIntersect != nil {
									reflectionColor = reflectionColor.Add(newColor)
									reflectionTimes++
									newReflectionDir := reflectionRay.Direction.Reflect(newNormal)
									reflectionRay = Ray{
										Origin:    newIntersect.Add(newReflectionDir.Mul(shadowBias)),
										Direction: newReflectionDir,
									}
								} else {
									break
								}
							}

							if reflectionTimes > 0 {
								color = color.Add(reflectionColor.Div(float64(reflectionTimes)))
							}
						}

						colorSum = colorSum.Add(color)
					}

					avgColor := colorSum.Div(float64(samplesPerPixel))
					r, g, b := avgColor.ToRGB()
					img.Set(x, y, color.RGBA{
						R: uint8(r),
						G: uint8(g),
						B: uint8(b),
						A: 255,
					})
				}
			}
		}()
	}
}

func main() {
	initScene()
	skybox, _ = NewSkybox("windows.png")

	ebiten.SetWindowSize(screenWidth, screenHeight)
	ebiten.SetWindowTitle("Go Raytracer - Progressive Rendering (Press S to save)")
	ebiten.SetWindowResizingMode(ebiten.WindowResizingModeDisabled)

	game := &Game{}
	if err := ebiten.RunGame(game); err != nil {
		log.Fatal(err)
	}
}
