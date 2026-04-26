package handlers

type ServiceCreateRequest struct {
	Title string `json:"title" example:"Диагностика оборудования"`
}

type CompanyCreateRequest struct {
	Name string `json:"name" example:"Газпром сервис"`
}

type BookingCreateRequest struct {
	UserID      *int64  `json:"user_id,omitempty"`
	Description *string `json:"description,omitempty"`
	Status      string  `json:"status,omitempty" example:"requested"`
}
