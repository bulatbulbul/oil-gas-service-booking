package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/http-server/repository"
)

type BusinessHandler struct {
	businessRepo *repository.BusinessRepo
}

func NewBusinessHandler(businessRepo *repository.BusinessRepo) *BusinessHandler {
	return &BusinessHandler{businessRepo: businessRepo}
}

// GET /business/companies-by-service/{service}
func (h *BusinessHandler) FindCompaniesByService(w http.ResponseWriter, r *http.Request) {
	service := chi.URLParam(r, "service")

	companies, err := h.businessRepo.FindCompaniesByService(service)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(companies) == 0 {
		http.Error(w, "No companies found for this service", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(companies)
}

// GET /business/users-with-active-bookings
func (h *BusinessHandler) FindUsersWithActiveBookings(w http.ResponseWriter, r *http.Request) {
	users, err := h.businessRepo.FindUsersWithActiveBookings()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// GET /business/company-stats
func (h *BusinessHandler) GetCompanyStats(w http.ResponseWriter, r *http.Request) {
	// Параметры для фильтрации по дате
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	var fromDate, toDate time.Time
	var err error

	if fromStr != "" {
		fromDate, err = time.Parse("2006-01-02", fromStr)
		if err != nil {
			http.Error(w, "Invalid from date format. Use YYYY-MM-DD", http.StatusBadRequest)
			return
		}
	} else {
		fromDate = time.Now().AddDate(0, -1, 0) // По умолчанию: последний месяц
	}

	if toStr != "" {
		toDate, err = time.Parse("2006-01-02", toStr)
		if err != nil {
			http.Error(w, "Invalid to date format. Use YYYY-MM-DD", http.StatusBadRequest)
			return
		}
	} else {
		toDate = time.Now() // По умолчанию: текущая дата
	}

	stats, err := h.businessRepo.GetCompanyStats(fromDate, toDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GET /business/popular-services
func (h *BusinessHandler) FindPopularServices(w http.ResponseWriter, r *http.Request) {
	limit := 10
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err == nil && l > 0 {
			limit = l
		}
	}

	services, err := h.businessRepo.FindPopularServices(limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(services)
}

// GET /business/search
func (h *BusinessHandler) SearchAll(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query parameter 'q' is required", http.StatusBadRequest)
		return
	}

	results, err := h.businessRepo.SearchAll(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// GET /business/system-overview
func (h *BusinessHandler) GetSystemOverview(w http.ResponseWriter, r *http.Request) {
	// Используем несколько запросов для создания общего отчета

	// 1. Популярные услуги
	popularServices, err := h.businessRepo.FindPopularServices(5)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Пользователи с активными бронированиями
	activeUsers, err := h.businessRepo.FindUsersWithActiveBookings()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Статистика за последний месяц
	fromDate := time.Now().AddDate(0, -1, 0)
	toDate := time.Now()
	companyStats, err := h.businessRepo.GetCompanyStats(fromDate, toDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"popular_services": popularServices,
		"active_users":     activeUsers,
		"company_stats":    companyStats,
		"period": map[string]string{
			"from": fromDate.Format("2006-01-02"),
			"to":   toDate.Format("2006-01-02"),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
