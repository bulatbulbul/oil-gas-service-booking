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

	if company.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	company.UserID = userID

	if err := h.repo.Create(&company); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(company)
}

func (h *CompanyHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(data)
}

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

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(company)
}

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

	if company.UserID != userID {
		http.Error(w, "forbidden: not your company", http.StatusForbidden)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(company); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if company.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	company.UserID = userID

	if err := h.repo.Update(company); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(company)
}

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

func (h *CompanyHandler) GetMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

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

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(mine)
}
