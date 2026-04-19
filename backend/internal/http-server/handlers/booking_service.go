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

type BookingServiceRequest struct {
	BookingID        int64   `json:"booking_id"`
	CompanyServiceID int64   `json:"company_service_id"`
	Notes            *string `json:"notes,omitempty"`
}

func (h *BookingServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input BookingServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if input.BookingID <= 0 {
		http.Error(w, "booking_id is required", http.StatusBadRequest)
		return
	}
	if input.CompanyServiceID <= 0 {
		http.Error(w, "company_service_id is required", http.StatusBadRequest)
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
