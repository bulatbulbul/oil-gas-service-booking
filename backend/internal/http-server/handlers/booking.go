package handlers

import (
	"encoding/json"
	"net/http"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"strconv"

	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/models"
)

type BookingHandler struct {
	repo *repository.BookingRepo
}

func NewBookingHandler(repo *repository.BookingRepo) *BookingHandler {
	return &BookingHandler{repo: repo}
}

// BookingServiceItemRequest - запрос на добавление услуги в бронирование
type BookingServiceItemRequest struct {
	CompanyServiceID int64   `json:"company_service_id"`
	Notes            *string `json:"notes,omitempty"`
}

// CreateBookingRequest - запрос на создание бронирования
type CreateBookingRequest struct {
	Description *string                     `json:"description,omitempty"`
	Status      string                      `json:"status,omitempty"`
	UserID      *int64                      `json:"user_id,omitempty"` // Только для админов
	Services    []BookingServiceItemRequest `json:"services,omitempty"`
}

// CreateBooking godoc
func (h *BookingHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input BookingCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID, role, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "user not authenticated", http.StatusUnauthorized)
		return
	}

	if role == "admin" {
		if input.UserID == nil {
			input.UserID = &userID
		}
	} else {
		input.UserID = &userID
	}

	validStatuses := map[string]bool{
		"requested": true,
		"approved":  true,
		"completed": true,
		"rejected":  true,
		"cancelled": true,
	}
	if input.Status == "" {
		input.Status = "requested"
	}
	if !validStatuses[input.Status] {
		http.Error(w, "status must be one of: requested, approved, completed, rejected, cancelled", http.StatusBadRequest)
		return
	}

	booking := models.Booking{
		UserID:      input.UserID,
		Description: input.Description,
		Status:      input.Status,
	}

	if err := h.repo.Create(&booking); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(booking)
}

// GetBookings godoc
func (h *BookingHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	// только админ, это уже настроено в router.go

	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr != "" {
		id, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid user_id", http.StatusBadRequest)
			return
		}

		bookings, err := h.repo.GetByUserID(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = json.NewEncoder(w).Encode(bookings)
		return
	}

	// если user_id не передан — как раньше: все бронирования
	bookings, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(bookings)
}

// GetMyBookings godoc
func (h *BookingHandler) GetMyBookings(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "user not authenticated", http.StatusUnauthorized)
		return
	}

	bookings, err := h.repo.GetByUserID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bookings)
}

// GetBooking godoc
func (h *BookingHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	booking, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(booking)
}

// UpdateBooking godoc
func (h *BookingHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	booking, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(booking); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(booking); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(booking)
}

// DeleteBooking godoc
func (h *BookingHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetMyCompanyBookings godoc
func (h *BookingHandler) GetMyCompanyBookings(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "user not authenticated", http.StatusUnauthorized)
		return
	}

	bookings, err := h.repo.GetByCompanyOwner(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bookings)
}

// UpdateMyCompanyBookingStatus godoc
func (h *BookingHandler) UpdateMyCompanyBookingStatus(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "user not authenticated", http.StatusUnauthorized)
		return
	}

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	owned, err := h.repo.IsBookingOwnedByCompanyOwner(id, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !owned {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	validStatuses := map[string]bool{
		"requested": true,
		"approved":  true,
		"completed": true,
		"rejected":  true,
		"cancelled": true,
	}
	if !validStatuses[body.Status] {
		http.Error(w, "invalid status", http.StatusBadRequest)
		return
	}

	if err := h.repo.UpdateStatus(id, body.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// CancelMy godoc
func (h *BookingHandler) CancelMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "user not authenticated", http.StatusUnauthorized)
		return
	}

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	booking, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	if booking.UserID == nil || *booking.UserID != userID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	if booking.Status != "requested" && booking.Status != "approved" {
		http.Error(w, "cannot cancel booking with status: "+booking.Status, http.StatusBadRequest)
		return
	}

	if err := h.repo.UpdateStatus(id, "cancelled"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *BookingHandler) DeleteMy(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "user not authenticated", http.StatusUnauthorized)
		return
	}

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	booking, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	// защита: можно удалять только свою бронь
	if booking.UserID == nil || *booking.UserID != userID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
