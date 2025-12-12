package handlers

import (
	"encoding/json"
	"net/http"
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

// POST /bookings
func (h *BookingHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input models.Booking
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Можно добавить базовую валидацию
	if input.UserID == nil {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&input); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

// GET /bookings
func (h *BookingHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	bookings, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bookings)
}

// GET /bookings/{id}
func (h *BookingHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	booking, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(booking)
}

// PUT /bookings/{id}
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

// PATCH /bookings/{id}/status - специальный эндпоинт для изменения статуса
func (h *BookingHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	booking, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	var input struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	booking.Status = input.Status

	if err := h.repo.Update(booking); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(booking)
}

// DELETE /bookings/{id}
func (h *BookingHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	if err := h.repo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
