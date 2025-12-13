package router

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"oil-gas-service-booking/internal/http-server/handlers"
)

func NewRouter(
	companyHandler *handlers.CompanyHandler,
	userHandler *handlers.UserHandler,
	bookingHandler *handlers.BookingHandler,
	serviceHandler *handlers.ServiceHandler,
	businessHandler *handlers.BusinessHandler,
) *chi.Mux {

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Companies
	r.Route("/companies", func(r chi.Router) {
		r.Post("/", companyHandler.Create)
		r.Get("/", companyHandler.GetAll)
		r.Get("/{id}", companyHandler.GetByID)
		r.Put("/{id}", companyHandler.Update)
		r.Delete("/{id}", companyHandler.Delete)
	})

	// Services
	r.Route("/services", func(r chi.Router) {
		r.Post("/", serviceHandler.Create)
		r.Get("/", serviceHandler.GetAll)
		r.Get("/{id}", serviceHandler.GetByID)
		r.Put("/{id}", serviceHandler.Update)
		r.Delete("/{id}", serviceHandler.Delete)
	})

	// Users
	r.Route("/users", func(r chi.Router) {
		r.Post("/", userHandler.Create)
		r.Get("/", userHandler.GetAll)
		r.Get("/{id}", userHandler.GetByID)
		r.Put("/{id}", userHandler.Update)
		r.Delete("/{id}", userHandler.Delete)
	})

	// Bookings
	r.Route("/bookings", func(r chi.Router) {
		r.Post("/", bookingHandler.Create)
		r.Get("/", bookingHandler.GetAll)
		r.Get("/{id}", bookingHandler.GetByID)
		r.Put("/{id}", bookingHandler.Update)
		r.Delete("/{id}", bookingHandler.Delete)
	})

	// Business logic endpoints
	r.Route("/business", func(r chi.Router) {
		r.Get("/companies-by-service/{service}", businessHandler.FindCompaniesByService)
		r.Get("/users-with-active-bookings", businessHandler.FindUsersWithActiveBookings)
		r.Get("/company-stats", businessHandler.GetCompanyStats)
		r.Get("/popular-services", businessHandler.FindPopularServices)
		r.Get("/search", businessHandler.SearchAll)
		r.Get("/system-overview", businessHandler.GetSystemOverview)
	})

	return r
}
