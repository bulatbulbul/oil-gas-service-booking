package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/models"
)

// Нужно создать репозиторий ServiceRepository
type ServiceRepository interface {
	Create(service *models.Service) error
	GetAll() ([]models.Service, error)
	GetByID(id int64) (*models.Service, error)
	Update(service *models.Service) error
	Delete(id int64) error
}

type ServiceHandler struct {
	repo ServiceRepository
}

func NewServiceHandler(repo ServiceRepository) *ServiceHandler {
	return &ServiceHandler{repo: repo}
}

// Остальные методы аналогично CompanyHandler
// POST /services
func (h *ServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input models.Service
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&input); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(input)
}

// GET /services
func (h *ServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	services, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(services)
}

// GET /services/{id}
func (h *ServiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	service, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(service)
}

// PUT /services/{id}
func (h *ServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	service, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(service); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(service); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(service)
}

// DELETE /services/{id}
func (h *ServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
