package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/models"
)

type BookingServiceHandler struct {
	repo *repository.BookingServiceRepo
}

func NewBookingServiceHandler(repo *repository.BookingServiceRepo) *BookingServiceHandler {
	return &BookingServiceHandler{repo: repo}
}

// BookingServiceRequest - запрос на создание услуги в бронировании
type BookingServiceRequest struct {
	BookingID        int64   `json:"booking_id"`
	CompanyServiceID int64   `json:"company_service_id"`
	Notes            *string `json:"notes,omitempty"`
}

// CreateBookingService godoc
// @Summary Создать услугу в бронировании
// @Tags booking-services
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param data body BookingServiceRequest true "Данные услуги в бронировании"
// @Success 201 {object} models.BookingService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 500 {string} string
// @Router /booking-services [post]
func (h *BookingServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input BookingServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	bookingService := models.BookingService{
		BookingID:        input.BookingID,
		CompanyServiceID: input.CompanyServiceID,
		Notes:            input.Notes,
	}

	if err := h.repo.Create(&bookingService); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(bookingService)
}

// GetBookingServices godoc
// @Summary Получить все услуги в бронированиях
// @Tags booking-services
// @Security BasicAuth
// @Produce json
// @Success 200 {array} models.BookingService
// @Failure 401 {string} string
// @Failure 500 {string} string
// @Router /booking-services [get]
func (h *BookingServiceHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(data)
}

// GetBookingServiceByID godoc
// @Summary Получить услугу в бронировании по ID
// @Tags booking-services
// @Security BasicAuth
// @Produce json
// @Param id path int true "BookingService ID"
// @Success 200 {object} models.BookingService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Router /booking-services/{id} [get]
func (h *BookingServiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	bookingService, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking service not found", http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(bookingService)
}

// GetBookingServicesByBookingID godoc
// @Summary Получить услуги по ID бронирования
// @Tags booking-services
// @Security BasicAuth
// @Produce json
// @Param booking_id path int true "Booking ID"
// @Success 200 {array} models.BookingService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Router /bookings/{booking_id}/services [get]
func (h *BookingServiceHandler) GetByBookingID(w http.ResponseWriter, r *http.Request) {
	bookingID, err := strconv.ParseInt(chi.URLParam(r, "booking_id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid booking id", http.StatusBadRequest)
		return
	}

	bookingServices, err := h.repo.GetByBookingID(bookingID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	_ = json.NewEncoder(w).Encode(bookingServices)
}

// UpdateBookingService godoc
// @Summary Обновить услугу в бронировании
// @Tags booking-services
// @Security BasicAuth
// @Accept json
// @Produce json
// @Param id path int true "BookingService ID"
// @Param data body models.BookingService true "Данные для обновления"
// @Success 200 {object} models.BookingService
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /booking-services/{id} [put]
func (h *BookingServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	bookingService, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking service not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(bookingService); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.repo.Update(bookingService); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(bookingService)
}

// DeleteBookingService godoc
// @Summary Удалить услугу из бронирования
// @Tags booking-services
// @Security BasicAuth
// @Param id path int true "BookingService ID"
// @Success 204
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /booking-services/{id} [delete]
func (h *BookingServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
