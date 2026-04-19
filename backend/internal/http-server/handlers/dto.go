package handlers

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
