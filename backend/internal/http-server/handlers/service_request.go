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

	// Уведомляем всех админов о новой заявке
	var adminIDs []int64
	h.db.Model(&models.User{}).Where("role = 'admin'").Pluck("user_id", &adminIDs)
	if len(adminIDs) > 0 {
		notifs := make([]models.Notification, 0, len(adminIDs))
		for _, aid := range adminIDs {
			notifs = append(notifs, models.Notification{
				UserID:  aid,
				Title:   "Новая заявка на услугу",
				Message: "Пользователь запрашивает услугу «" + req.ServiceName + "». Рассмотрите и разошлите компаниям.",
			})
		}
		h.db.Create(&notifs)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

// GetAll — только для админа, с данными пользователя и откликами компаний
func (h *ServiceRequestHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	var requests []models.ServiceRequest
	if err := h.db.Preload("User").Preload("Responses.Company").Order("created_at desc").Find(&requests).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// NotifyCompanies — admin отправляет уведомление всем владельцам компаний
func (h *ServiceRequestHandler) NotifyCompanies(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var req models.ServiceRequest
	if err := h.db.First(&req, "request_id = ?", id).Error; err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	// Получаем уникальных владельцев компаний
	var ownerIDs []int64
	if err := h.db.Model(&models.Company{}).Distinct("user_id").Pluck("user_id", &ownerIDs).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(ownerIDs) == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int{"notified": 0})
		return
	}

	notifications := make([]models.Notification, 0, len(ownerIDs))
	for _, uid := range ownerIDs {
		notifications = append(notifications, models.Notification{
			UserID:     uid,
			Title:      "Новый запрос услуги",
			Message:    "Пользователи запрашивают услугу: «" + req.ServiceName + "». Рассмотрите возможность добавления её в ваш каталог.",
			ActionType: "add_service",
			RequestID:  &id,
		})
	}

	if err := h.db.Create(&notifications).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"notified": len(notifications)})
}

// Respond — владелец компании добавляет услугу из заявки в свою компанию
func (h *ServiceRequestHandler) Respond(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	requestID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var body struct {
		CompanyID int64 `json:"company_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.CompanyID == 0 {
		http.Error(w, "company_id is required", http.StatusBadRequest)
		return
	}

	// Проверяем что компания принадлежит пользователю
	var company models.Company
	if err := h.db.First(&company, "company_id = ? AND user_id = ?", body.CompanyID, userID).Error; err != nil {
		http.Error(w, "company not found", http.StatusForbidden)
		return
	}

	// Получаем заявку
	var req models.ServiceRequest
	if err := h.db.First(&req, "request_id = ?", requestID).Error; err != nil {
		http.Error(w, "request not found", http.StatusNotFound)
		return
	}

	// Ищем или создаём услугу с таким именем
	var service models.Service
	if err := h.db.Where("title = ?", req.ServiceName).First(&service).Error; err != nil {
		service = models.Service{Title: req.ServiceName}
		if err := h.db.Create(&service).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Добавляем услугу в компанию (если ещё не добавлена)
	var existing models.CompanyService
	if err := h.db.Where("company_id = ? AND service_id = ?", body.CompanyID, service.ServiceID).First(&existing).Error; err != nil {
		cs := models.CompanyService{CompanyID: body.CompanyID, ServiceID: service.ServiceID}
		if err := h.db.Create(&cs).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Фиксируем отклик и отправляем уведомления только если это первый отклик от этой компании
	var existingResp models.ServiceRequestResponse
	if h.db.Where("request_id = ? AND company_id = ?", requestID, body.CompanyID).First(&existingResp).Error != nil {
		h.db.Create(&models.ServiceRequestResponse{RequestID: requestID, CompanyID: body.CompanyID})

		// Автоматически переводим заявку в "reviewed"
		h.db.Model(&models.ServiceRequest{}).Where("request_id = ? AND status = 'pending'", requestID).Update("status", "reviewed")

		// Уведомляем автора заявки
		h.db.Create(&models.Notification{
			UserID:     req.UserID,
			Title:      "Услуга добавлена",
			Message:    "Компания «" + company.Name + "» добавила услугу «" + req.ServiceName + "» в свой каталог. Теперь вы можете её забронировать.",
			ActionType: "service_added",
			ActionData: req.ServiceName,
		})

		// Уведомляем всех админов
		var adminIDs []int64
		h.db.Model(&models.User{}).Where("role = 'admin'").Pluck("user_id", &adminIDs)
		if len(adminIDs) > 0 {
			notifs := make([]models.Notification, 0, len(adminIDs))
			for _, aid := range adminIDs {
				notifs = append(notifs, models.Notification{
					UserID:  aid,
					Title:   "Компания откликнулась на заявку",
					Message: "Компания «" + company.Name + "» добавила услугу «" + req.ServiceName + "» в свой каталог.",
				})
			}
			h.db.Create(&notifs)
		}
	}

	w.WriteHeader(http.StatusNoContent)
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
