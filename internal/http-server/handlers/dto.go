package handlers

// UserCreateRequest swagger:model
type UserCreateRequest struct {
	Name     string `json:"name" example:"Иван"`
	Email    string `json:"email" example:"ivan@example.com"`
	Password string `json:"password" example:"123456"`
	Role     string `json:"role" example:"customer"`
}

// ServiceCreateRequest swagger:model
type ServiceCreateRequest struct {
	Title string `json:"title" example:"Диагностика оборудования"`
}

// CompanyCreateRequest swagger:model
type CompanyCreateRequest struct {
	Name string `json:"name" example:"Газпром сервис"`
}

// BookingCreateRequest swagger:model
type BookingCreateRequest struct {
	UserID      *int64  `json:"user_id,omitempty"`
	Description *string `json:"description,omitempty"`
	Status      string  `json:"status,omitempty" example:"requested"`
}
