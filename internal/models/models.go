package models

// Company — сервисная компания
type Company struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"not null"`
	// Region      string
	// Description string

	// Связь: одна компания имеет много сервисов
	Services []Service `gorm:"foreignKey:CompanyID"`
}

// Service — конкретная услуга, предоставляемая компанией
type Service struct {
	ID        uint   `gorm:"primaryKey"`
	CompanyID uint   `gorm:"not null;index"`
	Title     string `gorm:"not null"`
	// Description string
	// Price       float64

	// Связь: один сервис может иметь много броней
	Bookings []Booking `gorm:"foreignKey:ServiceID"`
}

// Booking — бронь клиента на услугу
type Booking struct {
	ID         uint   `gorm:"primaryKey"`
	ServiceID  uint   `gorm:"not null;index"`
	ClientName string `gorm:"not null"`
	Status     string `gorm:"default:'pending'"` // pending, confirmed, cancelled
}
