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

// CompaniesByService godoc
// @Summary Поиск компании по услуге
// @Tags business
// @Security BasicAuth
// @Param service path string true "Service name"
// @Success 200
// @Failure 401
// @Router /business/companies-by-service/{service} [get]
func (h *BusinessHandler) FindCompaniesByService(w http.ResponseWriter, r *http.Request) {
	serviceID, err := strconv.ParseInt(chi.URLParam(r, "serviceId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}

	companies, err := h.businessRepo.FindCompaniesByServiceID(serviceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(companies)
}

// UsersWithBookings godoc
// @Summary Пользователи с активными бронированиями
// @Tags business
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /business/users-with-active-bookings [get]
func (h *BusinessHandler) FindUsersWithActiveBookings(w http.ResponseWriter, r *http.Request) {
	users, err := h.businessRepo.FindUsersWithActiveBookings()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// CompanyStats godoc
// @Summary Статистика компаний
// @Tags business
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /business/company-stats [get]
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

// PopularServices godoc
// @Summary Популярные услуги
// @Tags business
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /business/popular-services [get]
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

// GetSummary godoc
// @Summary Сводная статистика
// @Tags business
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /business/summary [get]
func (h *BusinessHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.businessRepo.GetSummary()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

// GetBookingsByDate godoc
// @Summary Бронирования по дням
// @Tags business
// @Security BasicAuth
// @Param from query string false "YYYY-MM-DD"
// @Param to   query string false "YYYY-MM-DD"
// @Success 200
// @Failure 401
// @Router /business/bookings-by-date [get]
func (h *BusinessHandler) GetBookingsByDate(w http.ResponseWriter, r *http.Request) {
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	to := time.Now()
	from := to.AddDate(0, 0, -29)

	if fromStr != "" {
		if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			from = t
		}
	}
	if toStr != "" {
		if t, err := time.Parse("2006-01-02", toStr); err == nil {
			to = t
		}
	}

	rows, err := h.businessRepo.GetBookingsByDate(from, to)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

// PopularCompanies godoc
// @Summary Популярные компании
// @Tags business
// @Security BasicAuth
// @Success 200
// @Failure 401
// @Router /business/popular-companies [get]
func (h *BusinessHandler) FindPopularCompanies(w http.ResponseWriter, r *http.Request) {
	limit := 10
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err == nil && l > 0 {
			limit = l
		}
	}

	companies, err := h.businessRepo.FindPopularCompanies(limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(companies)
}

// Search godoc
// @Summary  Поиск (компании и услуги)
// @Tags business
// @Security BasicAuth
// @Param q query string true "Search query"
// @Success 200
// @Failure 401
// @Router /business/search [get]
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
