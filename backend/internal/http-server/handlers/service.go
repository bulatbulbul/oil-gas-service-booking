package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"oil-gas-service-booking/internal/http-server/repository"
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
	repo               ServiceRepository
	companyRepo        *repository.CompanyRepository
	companyServiceRepo *repository.CompanyServiceRepo
}

func NewServiceHandler(
	repo ServiceRepository,
	companyRepo *repository.CompanyRepository,
	companyServiceRepo *repository.CompanyServiceRepo,
) *ServiceHandler {
	return &ServiceHandler{
		repo:               repo,
		companyRepo:        companyRepo,
		companyServiceRepo: companyServiceRepo,
	}
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
	_ = json.NewEncoder(w).Encode(service)
}

// GetServices godoc
// @Summary Получить все услуги
// @Tags services
// @Security BasicAuth
// @Success 200 {array} models.Service
// @Failure 401
// @Router /services [get]
func (h *ServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	services, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(services)
}

// GetService godoc
// @Summary Получить услугу по ID
// @Tags services
// @Security BasicAuth
// @Param id path int true "Service ID"
// @Success 200 {object} models.Service
// @Failure 400
// @Failure 401
// @Failure 404
// @Router /services/{id} [get]
func (h *ServiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	service, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(service)
}

// UpdateService godoc
// @Summary Обновить услугу
// @Tags services
// @Security BasicAuth
// @Param id path int true "Service ID"
// @Success 200 {object} models.Service
// @Failure 400
// @Failure 401
// @Failure 403
// @Failure 404
// @Router /services/{id} [put]
func (h *ServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

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

	_ = json.NewEncoder(w).Encode(service)
}

// DeleteService godoc
// @Summary Удалить услугу
// @Tags services
// @Security BasicAuth
// @Param id path int true "Service ID"
// @Success 204
// @Failure 400
// @Failure 401
// @Failure 403
// @Router /services/{id} [delete]
func (h *ServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetMyServices godoc
// @Summary Получить услуги моих компаний
// @Tags services
// @Security BasicAuth
// @Produce json
// @Success 200 {array} models.Service
// @Failure 401 {string} string
// @Failure 500 {string} string
// @Router /services/my [get]
func (h *ServiceHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// 1. Все компании
	companies, err := h.companyRepo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. ID моих компаний
	myCompanyIDs := map[int64]struct{}{}
	for _, c := range companies {
		if c.UserID == userID {
			myCompanyIDs[c.CompanyID] = struct{}{}
		}
	}

	if len(myCompanyIDs) == 0 {
		_ = json.NewEncoder(w).Encode([]models.Service{})
		return
	}

	// 3. Все связи company_service
	csList, err := h.companyServiceRepo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 4. ID услуг моих компаний
	myServiceIDs := map[int64]struct{}{}
	for _, cs := range csList {
		if _, ok := myCompanyIDs[cs.CompanyID]; ok {
			myServiceIDs[cs.ServiceID] = struct{}{}
		}
	}

	if len(myServiceIDs) == 0 {
		_ = json.NewEncoder(w).Encode([]models.Service{})
		return
	}

	// 5. Все услуги и фильтр по myServiceIDs
	allServices, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var myServices []models.Service
	for _, s := range allServices {
		if _, ok := myServiceIDs[s.ServiceID]; ok {
			myServices = append(myServices, s)
		}
	}

	_ = json.NewEncoder(w).Encode(myServices)
}
