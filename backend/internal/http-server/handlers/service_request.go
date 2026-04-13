package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"oil-gas-service-booking/internal/models"
)

type ServiceRequestHandler struct {
	db *gorm.DB
}

func NewServiceRequestHandler(db *gorm.DB) *ServiceRequestHandler {
	return &ServiceRequestHandler{db: db}
}

// Create — пользователь подаёт заявку на услугу
func (h *ServiceRequestHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var body struct {
		ServiceName string  `json:"service_name"`
		Comment     *string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if body.ServiceName == "" {
		http.Error(w, "service_name is required", http.StatusBadRequest)
		return
	}

	req := models.ServiceRequest{
		UserID:      userID,
		ServiceName: body.ServiceName,
		Comment:     body.Comment,
		Status:      "pending",
	}
	if err := h.db.Create(&req).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

// GetAll — только для админа, с данными пользователя
func (h *ServiceRequestHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	var requests []models.ServiceRequest
	if err := h.db.Preload("User").Order("created_at desc").Find(&requests).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// UpdateStatus — админ меняет статус заявки (pending → reviewed)
func (h *ServiceRequestHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if body.Status != "pending" && body.Status != "reviewed" {
		http.Error(w, "status must be pending or reviewed", http.StatusBadRequest)
		return
	}

	if err := h.db.Model(&models.ServiceRequest{}).Where("request_id = ?", id).Update("status", body.Status).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
