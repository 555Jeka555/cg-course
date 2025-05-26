package main

// SceneObject определяет общий интерфейс для всех объектов сцены
type SceneObject interface {
	Intersection(ray Ray) (IntersectionResult, bool) // Проверка пересечения с лучом
	GetNormal(hitPosition Vector) Vector             // Получение нормали в точке
	GetMaterial(hitPosition Vector) Material         // Получение материала объекта
}

// IntersectionResult содержит полную информацию о пересечении
type IntersectionResult struct {
	Point    Vector      // Точка пересечения
	Distance float64     // Расстояние от начала луча
	Object   SceneObject // Ссылка на объект
}

// Material содержит свойства материала объекта
type Material struct {
	DiffuseColor  Vector
	SpecularColor Vector
	AmbientColor  Vector
	Shininess     float64
	Reflectivity  float64 // Добавим коэффициент отражения
}
