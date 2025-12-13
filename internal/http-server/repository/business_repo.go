package repository

import (
	"strings"
	"time"

	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type BusinessRepo struct {
	db *gorm.DB
}

func NewBusinessRepo(db *gorm.DB) *BusinessRepo {
	return &BusinessRepo{db: db}
}

// Вспомогательные функции для работы с коллекциями (аналог LINQ)
func Where[T any](collection []T, predicate func(T) bool) []T {
	var result []T
	for _, item := range collection {
		if predicate(item) {
			result = append(result, item)
		}
	}
	return result
}

func Select[T any, R any](collection []T, selector func(T) R) []R {
	var result []R
	for _, item := range collection {
		result = append(result, selector(item))
	}
	return result
}

// 1. Поиск компаний по услуге с использованием Where
func (r *BusinessRepo) FindCompaniesByService(serviceTitle string) ([]models.Company, error) {
	// Получаем все компании с их услугами
	var companies []models.Company
	err := r.db.Preload("CompanyServices.Service").Find(&companies).Error
	if err != nil {
		return nil, err
	}

	// Используем Where для фильтрации компаний, которые предоставляют нужную услугу
	filteredCompanies := Where(companies, func(c models.Company) bool {
		// Проверяем, есть ли у компании нужная услуга
		for _, cs := range c.CompanyServices {
			if cs.Service.Title == serviceTitle {
				return true
			}
		}
		return false
	})

	return filteredCompanies, nil
}

// 2. Поиск пользователей с активными бронированиями
type UserWithActiveBookings struct {
	UserID   int64  `json:"user_id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Bookings int    `json:"active_bookings"`
}

func (r *BusinessRepo) FindUsersWithActiveBookings() ([]UserWithActiveBookings, error) {
	// Получаем всех пользователей с их бронированиями
	var users []models.User
	err := r.db.Preload("Bookings").Find(&users).Error
	if err != nil {
		return nil, err
	}

	// Используем Where и Select для преобразования данных
	activeUsers := Where(users, func(u models.User) bool {
		// Подсчитываем активные бронирования
		activeCount := 0
		for _, booking := range u.Bookings {
			if booking.Status == "active" || booking.Status == "requested" {
				activeCount++
			}
		}
		return activeCount > 0
	})

	// Используем Select для преобразования в нужную структуру
	result := Select(activeUsers, func(u models.User) UserWithActiveBookings {
		// Подсчет активных бронирований
		activeCount := 0
		for _, booking := range u.Bookings {
			if booking.Status == "active" || booking.Status == "requested" {
				activeCount++
			}
		}

		email := ""
		if u.Email != nil {
			email = *u.Email
		}

		return UserWithActiveBookings{
			UserID:   u.UserID,
			Name:     u.Name,
			Email:    email,
			Role:     u.Role,
			Bookings: activeCount,
		}
	})

	return result, nil
}

// 3. Статистика по компаниям за период
type CompanyStats struct {
	CompanyName  string    `json:"company_name"`
	ServiceCount int       `json:"service_count"`
	BookingCount int       `json:"booking_count"`
	LastBooking  time.Time `json:"last_booking"`
}

func (r *BusinessRepo) GetCompanyStats(fromDate, toDate time.Time) ([]CompanyStats, error) {
	// Получаем все компании с их услугами и бронированиями
	var companies []models.Company
	err := r.db.
		Preload("CompanyServices.BookingServices.Booking").
		Find(&companies).Error

	if err != nil {
		return nil, err
	}

	// Используем Select для создания статистики
	stats := Select(companies, func(c models.Company) CompanyStats {
		// Подсчитываем количество услуг
		serviceCount := len(c.CompanyServices)

		// Подсчитываем бронирования за период
		bookingCount := 0
		var lastBooking time.Time

		for _, cs := range c.CompanyServices {
			for _, bs := range cs.BookingServices {
				if bs.Booking.CreatedAt.After(fromDate) && bs.Booking.CreatedAt.Before(toDate) {
					bookingCount++
					if bs.Booking.CreatedAt.After(lastBooking) {
						lastBooking = bs.Booking.CreatedAt
					}
				}
			}
		}

		return CompanyStats{
			CompanyName:  c.Name,
			ServiceCount: serviceCount,
			BookingCount: bookingCount,
			LastBooking:  lastBooking,
		}
	})

	// Фильтруем компании, у которых есть бронирования в указанный период
	filteredStats := Where(stats, func(s CompanyStats) bool {
		return s.BookingCount > 0
	})

	return filteredStats, nil
}

// 4. Поиск популярных услуг (услуги с наибольшим количеством бронирований)
type PopularService struct {
	ServiceID    int64  `json:"service_id"`
	Title        string `json:"title"`
	CompanyCount int    `json:"company_count"`
	BookingCount int    `json:"booking_count"`
}

func (r *BusinessRepo) FindPopularServices(limit int) ([]PopularService, error) {
	// Получаем все услуги с их компаниями и бронированиями
	var services []models.Service
	err := r.db.
		Preload("CompanyServices.BookingServices").
		Find(&services).Error

	if err != nil {
		return nil, err
	}

	// Используем Select для создания статистики по услугам
	serviceStats := Select(services, func(s models.Service) PopularService {
		// Подсчитываем количество компаний, предоставляющих эту услугу
		companyCount := len(s.CompanyServices)

		// Подсчитываем общее количество бронирований
		bookingCount := 0
		for _, cs := range s.CompanyServices {
			bookingCount += len(cs.BookingServices)
		}

		return PopularService{
			ServiceID:    s.ServiceID,
			Title:        s.Title,
			CompanyCount: companyCount,
			BookingCount: bookingCount,
		}
	})

	// Сортируем по количеству бронирований (по убыванию)
	for i := 0; i < len(serviceStats); i++ {
		for j := i + 1; j < len(serviceStats); j++ {
			if serviceStats[j].BookingCount > serviceStats[i].BookingCount {
				serviceStats[i], serviceStats[j] = serviceStats[j], serviceStats[i]
			}
		}
	}

	// Ограничиваем результат
	if limit > 0 && limit < len(serviceStats) {
		serviceStats = serviceStats[:limit]
	}

	return serviceStats, nil
}

// 5. Поиск по всем полям (компании и услуги)
type SearchResult struct {
	Type        string `json:"type"` // "company" или "service"
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (r *BusinessRepo) SearchAll(query string) ([]SearchResult, error) {
	// Получаем все компании
	var companies []models.Company
	err := r.db.Find(&companies).Error
	if err != nil {
		return nil, err
	}

	// Получаем все услуги
	var services []models.Service
	err = r.db.Find(&services).Error
	if err != nil {
		return nil, err
	}

	var results []SearchResult

	// Ищем в компаниях
	companyResults := Select(Where(companies, func(c models.Company) bool {
		return strings.Contains(strings.ToLower(c.Name), strings.ToLower(query))
	}), func(c models.Company) SearchResult {
		return SearchResult{
			Type: "company",
			ID:   c.CompanyID,
			Name: c.Name,
		}
	})
	results = append(results, companyResults...)

	// Ищем в услугах
	serviceResults := Select(Where(services, func(s models.Service) bool {
		return strings.Contains(strings.ToLower(s.Title), strings.ToLower(query))
	}), func(s models.Service) SearchResult {
		return SearchResult{
			Type: "service",
			ID:   s.ServiceID,
			Name: s.Title,
		}
	})
	results = append(results, serviceResults...)

	return results, nil
}
