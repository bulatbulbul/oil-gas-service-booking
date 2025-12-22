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

type CompanyHandler struct {
	repo *repository.CompanyRepository
}

func NewCompanyHandler(repo *repository.CompanyRepository) *CompanyHandler {
	return &CompanyHandler{repo: repo}
}

// CreateCompany godoc
// @Summary Create company
// @Tags companies
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param data body models.Company true "Company data"
// @Success 201 {object} models.Company
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 500 {string} string
// @Router /companies [post]
func (h *CompanyHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var company models.Company
	if err := json.NewDecoder(r.Body).Decode(&company); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// привязываем компанию к текущему пользователю
	company.UserID = userID

	if err := h.repo.Create(&company); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(company)
}

// GetCompanies godoc
// @Summary Get all companies
// @Tags companies
// @Security BasicAuth
// @Produce json
// @Success 200 {array} models.Company
// @Failure 500 {string} string
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
// @Summary Get company by ID
// @Tags companies
// @Security BasicAuth
// @Produce json
// @Param id path int true "Company ID"
// @Success 200 {object} models.Company
// @Failure 400 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
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
// @Summary Update company
// @Tags companies
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param id path int true "Company ID"
// @Param company body models.Company true "Company"
// @Success 200 {object} models.Company
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /companies/{id} [put]
func (h *CompanyHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	company, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}

	// разрешаем изменять только свою компанию
	if company.UserID != userID {
		http.Error(w, "forbidden: not your company", http.StatusForbidden)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(company); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// на всякий случай не даём переписать владельца
	company.UserID = userID

	if err := h.repo.Update(company); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(company)
}

// DeleteCompany godoc
// @Summary Delete company
// @Tags companies
// @Security BasicAuth
// @Param id path int true "Company ID"
// @Success 204
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 500 {string} string
// @Router /companies/{id} [delete]
func (h *CompanyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	company, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}

	if company.UserID != userID {
		http.Error(w, "forbidden: not your company", http.StatusForbidden)
		return
	}

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetMyCompanies godoc
// @Summary Get my companies
// @Tags companies
// @Security BasicAuth
// @Produce json
// @Success 200 {array} models.Company
// @Failure 401 {string} string
// @Failure 500 {string} string
// @Router /companies/my [get]
func (h *CompanyHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// простейший вариант через репозиторий
	all, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var mine []models.Company
	for _, c := range all {
		if c.UserID == userID {
			mine = append(mine, c)
		}
	}

	_ = json.NewEncoder(w).Encode(mine)
}
