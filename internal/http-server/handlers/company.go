package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/models"
)

type CompanyHandler struct {
	repo *repository.CompanyRepository
}

func NewCompanyHandler(repo *repository.CompanyRepository) *CompanyHandler {
	return &CompanyHandler{repo: repo}
}

// CreateCompany godoc
// @Summary Создать компанию
// @Tags companies
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param data body CompanyCreateRequest true "Данные компании"
// @Success 201 {object} models.Company
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 500 {string} string
// @Router /companies [post]
func (h *CompanyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input CompanyCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	company := models.Company{
		Name: input.Name,
	}

	if err := h.repo.Create(&company); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(company)
}

// GetCompanies godoc
// @Summary Получить список компаний
// @Tags companies
// @Security BasicAuth
// @Produce json
// @Success 200 {array} models.Company
// @Failure 401
// @Failure 500
// @Router /companies [get]
func (h *CompanyHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(data)
}

// GetCompany godoc
// @Summary Получить компанию по ID
// @Tags companies
// @Security BasicAuth
// @Produce json
// @Param id path int true "Company ID"
// @Success 200 {object} models.Company
// @Failure 401
// @Failure 404
// @Failure 500
// @Router /companies/{id} [get]
func (h *CompanyHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	company, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(company)
}

// UpdateCompany godoc
// @Summary Обновить компанию
// @Tags companies
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param id path int true "Company ID"
// @Param company body models.Company true "Company"
// @Success 200 {object} models.Company
// @Failure 400
// @Failure 401
// @Failure 403
// @Failure 404
// @Failure 500
// @Router /companies/{id} [put]
func (h *CompanyHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	company, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(company); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(company); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(company)
}

// DeleteCompany godoc
// @Summary Удалить компанию
// @Tags companies
// @Security BasicAuth
// @Param id path int true "Company ID"
// @Success 204
// @Failure 401
// @Failure 403
// @Failure 500
// @Router /companies/{id} [delete]
func (h *CompanyHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
