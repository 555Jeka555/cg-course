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
	shadowBias      = 0.0001 // Смещение для избежания самозатенения
	maxReflections  = 4      // Максимальное количество отражений
	samplesPerPixel = 3      // Сэмплов на пиксель (для антиалиасинга)
	gorutineLines   = 90     // Количество строк на одну горутину
)

var (
	objects        []SceneObject              // Объекты сцены
	light          DirectionalLight           // Источник света
	camera         Camera                     // Камера
	img            *image.RGBA                // Изображение для рендеринга
	saveKeyPressed bool                       // Флаг нажатия клавиши сохранения
	skybox, _      = NewSkybox("skubox.jpeg") // Скайбокс
)

func initScene() {
	// Инициализация камеры
	camera = NewCamera(
		Vector{0, 0, 10}, // Позиция камеры
		Vector{float64(screenWidth), float64(screenHeight), 0}, // Разрешение
		60,   // Угол обзора
		15.0, // Фокусное расстояние
		0.5,  // Апертура
	)

	// Материал для куба
	cubeMaterial := Material{
		DiffuseColor:  Vector{0.8, 0.5, 0.2}, // Диффузный цвет
		SpecularColor: Vector{0.5, 0.5, 0.5}, // Зеркальный цвет
		AmbientColor:  Vector{0.1, 0.1, 0.1}, // Фоновый цвет
		Shininess:     20,                    // Блеск
		Reflectivity:  0.3,                   // Отражательная способность
	}
	cube := NewCube(Vector{-7, -2, -10}, 2.0, cubeMaterial)

	// Материал для тора
	torus := NewTorus(1.0, 0.3, Material{
		DiffuseColor:  Vector{0.7, 1, 1},
		SpecularColor: Vector{0.5, 0.5, 0.5},
		AmbientColor:  Vector{0.1, 0.1, 0.1},
		Shininess:     20,
		Reflectivity:  0.3,
	})

	// Материал для тетраэдра
	tetrahedronMaterial := Material{
		DiffuseColor:  Vector{0.1, 0.1, 0.9}, // Синий цвет
		SpecularColor: Vector{0.5, 0.5, 0.5},
		AmbientColor:  Vector{0.1, 0.1, 0.1},
		Shininess:     20,
		Reflectivity:  0.3,
	}

	// Создание тетраэдра с базовыми вершинами
	tetrahedron := NewTetrahedron(
		Vector{3, -2, -10},
		Vector{5, -2, -10},
		Vector{4, 0, -10},
		Vector{4, -2, -8},
		tetrahedronMaterial,
	)

	// Применение преобразований к тетраэдру
	transform := Identity().
		Multiply(Translate(-5, -1, 5)). // Перемещение
		Multiply(RotateY(math.Pi / 4)). // Вращение вокруг Y
		Multiply(Scale(1.5, 1.5, 1.5))  // Масштабирование

	tetrahedron.ApplyTransform(transform)

	// Добавление объектов на сцену
	objects = []SceneObject{
		torus,
		cube,
		tetrahedron,
		NewInfinityChessBoard( // Бесконечная шахматная доска
			2,
			Vector{0, 0, 0},
			Vector{1, 1, 1},
		),
		NewSphere( // Сфера
			Vector{0, -2, -15}, 2,
			Material{
				DiffuseColor:  Vector{1, 1, 0}, // Желтый цвет
				SpecularColor: Vector{1, 1, 1},
				AmbientColor:  Vector{0.1, 0.1, 0.1},
				Shininess:     32,
			},
		),
	}

	// Настройка источника света
	light = NewLight(
		Vector{0, 1, -1},      // Направление света
		1.0,                   // Интенсивность
		Vector{1, 1, 1},       // Цвет диффузного света
		Vector{1, 1, 1},       // Цвет зеркального света
		Vector{0.2, 0.2, 0.2}, // Цвет фонового света
	)
}

// Умножение цветов (покомпонентное)
func multiplyColors(a, b Vector) Vector {
	return Vector{a.X * b.X, a.Y * b.Y, a.Z * b.Z}
}

// Сложение цветов (покомпонентное)
func addColors(a, b Vector) Vector {
	return Vector{a.X + b.X, a.Y + b.Y, a.Z + b.Z}
}

// Трассировка луча
func traceRay(ray Ray) (Vector, *Vector, SceneObject, Vector) {
	color := Vector{0, 0, 0} // Итоговый цвет
	var normal Vector        // Нормаль в точке пересечения
	var intersect *Vector    // Точка пересечения
	var obj SceneObject      // Объект пересечения

	// Проверка пересечения луча с объектами
	point, obj, hit := ray.Cast(objects)
	if hit {
		intersect = &point.Point
		normal = obj.GetNormal(point.Point)
		material := obj.GetMaterial(point.Point)

		// Фоновая составляющая (всегда присутствует)
		ambient := multiplyColors(material.AmbientColor, light.AmbientColor)

		// Инициализация диффузной и зеркальной составляющих
		diffuse := Vector{0, 0, 0}
		specular := Vector{0, 0, 0}

		// Проверка нахождения точки в тени
		lightDir := light.Direction.Neg().Normalize()
		shadowRay := Ray{Origin: point.Point.Add(lightDir.Mul(0.001)), Direction: lightDir}
		_, _, shadowHit := shadowRay.Cast(objects)

		if !shadowHit {
			// закон Ламберта
			// Диффузная составляющая (только если не в тени)
			diffuseIntensity := math.Max(0, normal.Dot(lightDir)) * light.Strength
			diffuse = multiplyColors(material.DiffuseColor, light.DiffuseColor).Mul(diffuseIntensity)

			// Зеркальная составляющая (только если не в тени)
			viewDir := camera.Position.Sub(point.Point).Normalize()
			reflectDir := normal.Mul(2 * normal.Dot(lightDir)).Sub(lightDir)
			specularIntensity := math.Pow(math.Max(0, viewDir.Dot(reflectDir)), material.Shininess)
			specular = multiplyColors(material.SpecularColor, light.SpecularColor).Mul(specularIntensity)
		}

		// Комбинирование всех составляющих
		color = addColors(ambient, addColors(diffuse, specular))
	} else {
		// Если нет пересечения - цвет из скайбокса
		color = skybox.GetImageCoords(ray.Direction)
	}

	return color, intersect, obj, normal
}

// Структура игры
type Game struct {
	rendered bool // Флаг завершения рендеринга
}

// Обновление состояния игры
func (g *Game) Update() error {
	if !g.rendered {
		go renderScene() // Запуск рендеринга
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

// Отрисовка кадра
func (g *Game) Draw(screen *ebiten.Image) {
	if img != nil {
		screen.ReplacePixels(img.Pix) // Обновление пикселей экрана
	}
	ebitenutil.DebugPrint(screen, "Go Raytracer - Progressive Rendering")
}

// Установка размера окна
func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return screenWidth, screenHeight
}

// Сохранение изображения через диалоговое окно
func saveImageWithDialog() {
	if img == nil {
		return
	}

	// Открытие диалогового окна для выбора файла
	filename, err := dialog.File().
		Title("Save Image").
		Filter("PNG Image", "png").
		SetStartDir(".").
		Save()

	if err != nil {
		if err != dialog.ErrCancelled {
			log.Printf("Ошибка открытия диалога сохранения: %v", err)
		}
		return
	}

	// Добавление расширения .png при необходимости
	if !strings.HasSuffix(strings.ToLower(filename), ".png") {
		filename += ".png"
	}

	// Создание директории, если она не существует
	dir := filepath.Dir(filename)
	if dir != "" {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Ошибка создания директории: %v", err)
			return
		}
	}

	// Создание файла
	file, err := os.Create(filename)
	if err != nil {
		log.Printf("Ошибка создания файла: %v", err)
		return
	}
	defer file.Close()

	// Сохранение изображения в формате PNG
	if err := png.Encode(file, img); err != nil {
		log.Printf("Ошибка кодирования PNG: %v", err)
		return
	}

	log.Printf("Изображение успешно сохранено в %s", filename)
}

// Рендеринг сцены
func renderScene() {
	rand.Seed(time.Now().UnixNano())
	img = image.NewRGBA(image.Rect(0, 0, screenWidth, screenHeight))

	// Параллельный рендеринг по строкам
	for i := 0; i < screenHeight/gorutineLines; i++ {
		i := i
		go func() {
			for y := i * gorutineLines; y < (i+1)*gorutineLines; y++ {
				for x := 0; x < screenWidth; x++ {
					colorSum := Vector{0, 0, 0}

					// Сэмплирование для антиалиасинга
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

							// Рекурсивная трассировка отражений
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

					// Усреднение цвета по сэмплам
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

	// Настройка окна
	ebiten.SetWindowSize(screenWidth, screenHeight)
	ebiten.SetWindowTitle("Go Raytracer - Progressive Rendering (Press S to save)")
	ebiten.SetWindowResizingMode(ebiten.WindowResizingModeDisabled)

	// Запуск игры
	game := &Game{}
	if err := ebiten.RunGame(game); err != nil {
		log.Fatal(err)
	}
}
