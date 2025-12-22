package models

import "time"

type Company struct {
	CompanyID   int64     `gorm:"column:company_id;primaryKey;autoIncrement"`
	UserID      int64     `gorm:"column:user_id;not null;index"` // владелец
	Name        string    `gorm:"column:name;not null"`
	Description *string   `gorm:"column:description"`
	Address     *string   `gorm:"column:address"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime"`

	User            User             `gorm:"foreignKey:UserID;references:UserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	CompanyServices []CompanyService `gorm:"foreignKey:CompanyID"`
}

func (Company) TableName() string { return "company" }

type Service struct {
	ServiceID       int64            `gorm:"column:service_id;primaryKey;autoIncrement"`
	Title           string           `gorm:"column:title;not null"`
	Description     *string          `gorm:"column:description"`
	Price           *float64         `gorm:"column:price"`
	CreatedAt       time.Time        `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt       time.Time        `gorm:"column:updated_at;autoUpdateTime"`
	CompanyServices []CompanyService `gorm:"foreignKey:ServiceID"`
}

func (Service) TableName() string { return "service" }

type CompanyService struct {
	CompanyServiceID int64     `gorm:"column:company_service_id;primaryKey;autoIncrement"`
	CompanyID        int64     `gorm:"column:company_id;not null;index"`
	ServiceID        int64     `gorm:"column:service_id;not null;index"`
	Price            *float64  `gorm:"column:price"` // цена конкретной услуги у компании
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime"`

	Company         Company          `gorm:"foreignKey:CompanyID;references:CompanyID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Service         Service          `gorm:"foreignKey:ServiceID;references:ServiceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	BookingServices []BookingService `gorm:"foreignKey:CompanyServiceID"`
}

func (CompanyService) TableName() string { return "company_service" }

type User struct {
	UserID    int64     `gorm:"column:user_id;primaryKey;autoIncrement"`
	Name      string    `gorm:"column:name;not null"`
	Email     *string   `gorm:"column:email;uniqueIndex"`
	Password  string    `gorm:"column:password;not null"`
	Role      string    `gorm:"column:role;default:'customer'"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime"`

	// Добавляем обратную связь
	Companies []Company `gorm:"foreignKey:UserID"`
	Bookings  []Booking `gorm:"foreignKey:UserID"`
}

func (User) TableName() string { return "user" }

type Booking struct {
	BookingID   int64     `gorm:"column:booking_id;primaryKey;autoIncrement"`
	UserID      *int64    `gorm:"column:user_id;index"`
	Description *string   `gorm:"column:description"`
	Status      string    `gorm:"column:status;not null;default:'requested'"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime"`

	User            *User            `gorm:"foreignKey:UserID;references:UserID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	BookingServices []BookingService `gorm:"foreignKey:BookingID"`
}

func (Booking) TableName() string { return "booking" }

type BookingService struct {
	BookingServiceID int64     `gorm:"column:booking_service_id;primaryKey;autoIncrement"`
	BookingID        int64     `gorm:"column:booking_id;not null;index"`
	CompanyServiceID int64     `gorm:"column:company_service_id;not null;index"`
	Notes            *string   `gorm:"column:notes"`
	Quantity         *int      `gorm:"column:quantity;default:1"`
	CreatedAt        time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt        time.Time `gorm:"column:updated_at;autoUpdateTime"`

	Booking        Booking        `gorm:"foreignKey:BookingID;references:BookingID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CompanyService CompanyService `gorm:"foreignKey:CompanyServiceID;references:CompanyServiceID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

func (BookingService) TableName() string { return "booking_service" }
