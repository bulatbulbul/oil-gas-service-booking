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
// @Summary Создать бронирование
// @Description Создание нового бронирования
// @Tags bookings
// @Accept json
// @Produce json
// @Param data body BookingCreateRequest true "Данные бронирования"
// @Success 201 {object} models.Booking
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 500 {string} string
// @Security BasicAuth
// @Router /bookings [post]
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

	booking := models.Booking{
		UserID:      input.UserID,
		Description: input.Description,
		Status:      input.Status,
	}

	if booking.Status == "" {
		booking.Status = "requested"
	}

	if err := h.repo.Create(&booking); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(booking)
}

// GetBookings godoc
// @Summary Получить бронирования
// @Tags bookings
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /bookings [get]
func (h *BookingHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	bookings, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bookings)
}

// GetBooking godoc
// @Summary Получить бронирование
// @Tags bookings
// @Security BasicAuth
// @Param id path int true "Booking ID"
// @Success 200
// @Failure 401
// @Router /bookings/{id} [get]
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
// @Summary Обновить бронирование
// @Tags bookings
// @Security BasicAuth
// @Param id path int true "Booking ID"
// @Success 200
// @Failure 401
// @Failure 403
// @Router /bookings/{id} [put]
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
// @Summary Удалить бронирование
// @Tags bookings
// @Security BasicAuth
// @Param id path int true "Booking ID"
// @Success 204
// @Failure 401
// @Failure 403
// @Router /bookings/{id} [delete]
func (h *BookingHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
