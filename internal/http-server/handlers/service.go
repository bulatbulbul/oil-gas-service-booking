package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/models"
)

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

// CreateService godoc
// @Summary Создать услугу
// @Tags services
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param data body ServiceCreateRequest true "Данные услуги"
// @Success 201 {object} models.Service
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 500 {string} string
// @Router /services [post]
func (h *ServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input ServiceCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	service := models.Service{
		Title: input.Title,
	}

	if err := h.repo.Create(&service); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(service)
}

// GetServices godoc
// @Summary Получить услуги
// @Tags services
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /services [get]
func (h *ServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	services, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(services)
}

// GetService godoc
// @Summary Получить услугу по ID
// @Tags services
// @Security BasicAuth
// @Param id path int true "Service ID"
// @Success 200
// @Failure 401
// @Router /services/{id} [get]
func (h *ServiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	service, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(service)
}

// UpdateService godoc
// @Summary Обновить услугу
// @Tags services
// @Security BasicAuth
// @Param id path int true "Service ID"
// @Success 200
// @Failure 401
// @Failure 403
// @Router /services/{id} [put]
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

// DeleteService godoc
// @Summary Удалить услугу
// @Tags services
// @Security BasicAuth
// @Param id path int true "Service ID"
// @Success 204
// @Failure 401
// @Failure 403
// @Router /services/{id} [delete]
func (h *ServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
