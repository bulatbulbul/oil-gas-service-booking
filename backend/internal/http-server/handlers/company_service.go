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

type CompanyServiceHandler struct {
	repo        *repository.CompanyServiceRepo
	companyRepo *repository.CompanyRepository
}

func NewCompanyServiceHandler(
	repo *repository.CompanyServiceRepo,
	companyRepo *repository.CompanyRepository,
) *CompanyServiceHandler {
	return &CompanyServiceHandler{
		repo:        repo,
		companyRepo: companyRepo,
	}
}

// CompanyServiceCreateRequest - запрос на создание связи компании и услуги
type CompanyServiceCreateRequest struct {
	CompanyID int64 `json:"company_id"`
	ServiceID int64 `json:"service_id"`
}

// CreateCompanyService godoc
func (h *CompanyServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var input CompanyServiceCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if input.CompanyID <= 0 {
		http.Error(w, "company_id is required", http.StatusBadRequest)
		return
	}
	if input.ServiceID <= 0 {
		http.Error(w, "service_id is required", http.StatusBadRequest)
		return
	}

	company, err := h.companyRepo.GetByID(input.CompanyID)
	if err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}
	if company.UserID != userID && role != "admin" {
		http.Error(w, "forbidden: not your company", http.StatusForbidden)
		return
	}

	cs := models.CompanyService{
		CompanyID: input.CompanyID,
		ServiceID: input.ServiceID,
	}

	if err := h.repo.Create(&cs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(cs)
}

// GetCompanyServicesByCompanyID godoc
func (h *CompanyServiceHandler) GetByCompanyID(w http.ResponseWriter, r *http.Request) {
	companyID, err := strconv.ParseInt(chi.URLParam(r, "company_id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid company id", http.StatusBadRequest)
		return
	}

	list, err := h.repo.GetByCompanyID(companyID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(list)
}

// GetCompanyServicesByServiceID godoc
func (h *CompanyServiceHandler) GetByServiceID(w http.ResponseWriter, r *http.Request) {
	serviceID, err := strconv.ParseInt(chi.URLParam(r, "service_id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}

	list, err := h.repo.GetByServiceID(serviceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(list)
}

// UpdateCompanyService godoc
func (h *CompanyServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	cs, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company service not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(cs); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(cs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(cs)
}

// DeleteCompanyService godoc
func (h *CompanyServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

// GetMyCompanyServices godoc
func (h *CompanyServiceHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	list, err := h.repo.GetByOwner(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(list)
}
