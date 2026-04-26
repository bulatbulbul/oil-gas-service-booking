package handlers

import (
	"encoding/json"
	"net/http"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/models"
)

type BookingHandler struct {
	repo *repository.BookingRepo
	db   *gorm.DB
}

func NewBookingHandler(repo *repository.BookingRepo, db *gorm.DB) *BookingHandler {
	return &BookingHandler{repo: repo, db: db}
}

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

func (h *BookingHandler) GetAll(w http.ResponseWriter, r *http.Request) {
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

	bookings, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(bookings)
}

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

func (h *BookingHandler) GetByID(w http.ResponseWriter, r *http.Request) {
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

	json.NewEncoder(w).Encode(booking)
}

func (h *BookingHandler) Update(w http.ResponseWriter, r *http.Request) {
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

func (h *BookingHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

	if body.Status == "approved" || body.Status == "rejected" || body.Status == "completed" {
		booking, err := h.repo.GetByID(id)
		if err == nil && booking.UserID != nil {
			var bs models.BookingService
			serviceName, companyName := "", ""
			if h.db.Preload("CompanyService.Service").Preload("CompanyService.Company").
				Where("booking_id = ?", id).First(&bs).Error == nil {
				serviceName = bs.CompanyService.Service.Title
				companyName = bs.CompanyService.Company.Name
			}

			title, message := "", ""
			switch body.Status {
			case "approved":
				title = "Бронирование подтверждено"
				message = "Компания «" + companyName + "» подтвердила вашу бронь услуги «" + serviceName + "»."
			case "rejected":
				title = "Бронирование отклонено"
				message = "Компания «" + companyName + "» отклонила вашу бронь услуги «" + serviceName + "»."
			case "completed":
				title = "Бронирование выполнено"
				message = "Компания «" + companyName + "» выполнила услугу «" + serviceName + "»."
			}
			h.db.Create(&models.Notification{
				UserID:  *booking.UserID,
				Title:   title,
				Message: message,
			})
		}
	}

	w.WriteHeader(http.StatusOK)
}

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

	var ownerIDs []int64
	h.db.Model(&models.BookingService{}).
		Joins("JOIN company_service ON company_service.company_service_id = booking_service.company_service_id").
		Joins("JOIN company ON company.company_id = company_service.company_id").
		Where("booking_service.booking_id = ?", id).
		Distinct("company.user_id").
		Pluck("company.user_id", &ownerIDs)

	var userName string
	if booking.User != nil {
		userName = booking.User.Name
	} else {
		h.db.Model(&models.User{}).Where("user_id = ?", userID).Pluck("name", &userName)
	}
	if len(ownerIDs) > 0 {
		var bs models.BookingService
		serviceName := ""
		if h.db.Preload("CompanyService.Service").Where("booking_id = ?", id).First(&bs).Error == nil {
			serviceName = bs.CompanyService.Service.Title
		}
		notifs := make([]models.Notification, 0, len(ownerIDs))
		for _, oid := range ownerIDs {
			msg := "Пользователь " + userName + " отменил бронь услуги «" + serviceName + "»."
			notifs = append(notifs, models.Notification{
				UserID:  oid,
				Title:   "Бронь отменена",
				Message: msg,
			})
		}
		h.db.Create(&notifs)
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
