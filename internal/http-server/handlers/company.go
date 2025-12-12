package handlers

import (
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"net/http"
	"strconv"

	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/models"
)

type CompanyHandler struct {
	repo *repository.CompanyRepository
}

func NewCompanyHandler(repo *repository.CompanyRepository) *CompanyHandler {
	return &CompanyHandler{repo: repo}
}

// POST /companies
func (h *CompanyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input models.Company
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

// GET /companies
func (h *CompanyHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(data)
}

// GET /companies/{id}
func (h *CompanyHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	company, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(company)
}

// PUT /companies/{id}
func (h *CompanyHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

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

	json.NewEncoder(w).Encode(company)
}

// DELETE /companies/{id}
func (h *CompanyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
