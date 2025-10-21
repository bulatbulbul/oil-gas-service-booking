package models

import "time"

type Company struct {
	CompanyID int64     `json:"company_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Service struct {
	ServiceID int64     `json:"service_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CompanyService struct {
	CompanyServiceID int64     `json:"company_service_id"`
	CompanyID        int64     `json:"company_id"`
	ServiceID        int64     `json:"service_id"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type User struct {
	UserID    int64     `json:"user_id"`
	Name      string    `json:"name"`
	Email     *string   `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Booking struct {
	BookingID   int64     `json:"booking_id"`
	UserID      *int64    `json:"user_id"`
	Description *string   `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type BookingService struct {
	BookingServiceID int64     `json:"booking_service_id"`
	BookingID        int64     `json:"booking_id"`
	ServiceID        int64     `json:"service_id"`
	Notes            *string   `json:"notes"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
