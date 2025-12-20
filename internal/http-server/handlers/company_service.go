package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/models"
)

type CompanyServiceHandler struct {
	repo *repository.CompanyServiceRepo
}

func NewCompanyServiceHandler(repo *repository.CompanyServiceRepo) *CompanyServiceHandler {
	return &CompanyServiceHandler{repo: repo}
}

// CompanyServiceCreateRequest - запрос на создание связи компании и услуги
type CompanyServiceCreateRequest struct {
	CompanyID int64 `json:"company_id"`
	ServiceID int64 `json:"service_id"`
}

// CreateCompanyService godoc
// @Summary Создать связь компании и услуги
// @Tags company-services
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param data body CompanyServiceCreateRequest true "Данные связи компании и услуги"
// @Success 201 {object} models.CompanyService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 500 {string} string
// @Router /company-services [post]
func (h *CompanyServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input CompanyServiceCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	companyService := models.CompanyService{
		CompanyID: input.CompanyID,
		ServiceID: input.ServiceID,
	}

	if err := h.repo.Create(&companyService); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(companyService)
}

// GetCompanyServices godoc
// @Summary Получить все связи компаний и услуг
// @Tags company-services
// @Security BasicAuth
// @Produce json
// @Success 200 {array} models.CompanyService
// @Failure 401 {string} string
// @Failure 500 {string} string
// @Router /company-services [get]
func (h *CompanyServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(data)
}

// GetCompanyServiceByID godoc
// @Summary Получить связь компании и услуги по ID
// @Tags company-services
// @Security BasicAuth
// @Produce json
// @Param id path int true "CompanyService ID"
// @Success 200 {object} models.CompanyService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Router /company-services/{id} [get]
func (h *CompanyServiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	companyService, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company service not found", http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(companyService)
}

// GetCompanyServicesByCompanyID godoc
// @Summary Получить услуги компании
// @Tags company-services
// @Security BasicAuth
// @Produce json
// @Param company_id path int true "Company ID"
// @Success 200 {array} models.CompanyService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Router /companies/{company_id}/services [get]
func (h *CompanyServiceHandler) GetByCompanyID(w http.ResponseWriter, r *http.Request) {
	companyID, err := strconv.ParseInt(chi.URLParam(r, "company_id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid company id", http.StatusBadRequest)
		return
	}

	companyServices, err := h.repo.GetByCompanyID(companyID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(companyServices)
}

// GetCompanyServicesByServiceID godoc
// @Summary Получить компании, предоставляющие услугу
// @Tags company-services
// @Security BasicAuth
// @Produce json
// @Param service_id path int true "Service ID"
// @Success 200 {array} models.CompanyService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Router /services/{service_id}/companies [get]
func (h *CompanyServiceHandler) GetByServiceID(w http.ResponseWriter, r *http.Request) {
	serviceID, err := strconv.ParseInt(chi.URLParam(r, "service_id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}

	companyServices, err := h.repo.GetByServiceID(serviceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(companyServices)
}

// UpdateCompanyService godoc
// @Summary Обновить связь компании и услуги
// @Tags company-services
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param id path int true "CompanyService ID"
// @Param data body models.CompanyService true "Данные для обновления"
// @Success 200 {object} models.CompanyService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /company-services/{id} [put]
func (h *CompanyServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	companyService, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company service not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(companyService); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(companyService); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(companyService)
}

// DeleteCompanyService godoc
// @Summary Удалить связь компании и услуги
// @Tags company-services
// @Security BasicAuth
// @Param id path int true "CompanyService ID"
// @Success 204
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /company-services/{id} [delete]
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
