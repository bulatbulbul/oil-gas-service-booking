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
	serviceRepo        *repository.ServiceRepo
	companyRepo        *repository.CompanyRepository
	companyServiceRepo *repository.CompanyServiceRepo
}

func NewServiceHandler(
	repo ServiceRepository,
	serviceRepo *repository.ServiceRepo,
	companyRepo *repository.CompanyRepository,
	companyServiceRepo *repository.CompanyServiceRepo,
) *ServiceHandler {
	return &ServiceHandler{
		repo:               repo,
		serviceRepo:        serviceRepo,
		companyRepo:        companyRepo,
		companyServiceRepo: companyServiceRepo,
	}
}

// CreateService godoc
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
func (h *ServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	services, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(services)
}

// GetService godoc
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

// GetAvailableServices godoc
func (h *ServiceHandler) GetAvailable(w http.ResponseWriter, r *http.Request) {
	services, err := h.serviceRepo.GetAvailable()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(services)
}

// GetMyServices godoc
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
