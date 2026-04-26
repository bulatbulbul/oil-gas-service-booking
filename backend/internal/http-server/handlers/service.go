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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(service)
}

func (h *ServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	services, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(services)
}

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

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(service)
}

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

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(service)
}

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

func (h *ServiceHandler) GetAvailable(w http.ResponseWriter, r *http.Request) {
	services, err := h.serviceRepo.GetAvailable()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(services)
}

func (h *ServiceHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	companies, err := h.companyRepo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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

	csList, err := h.companyServiceRepo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

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
