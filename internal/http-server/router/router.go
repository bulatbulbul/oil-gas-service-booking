package router

import (
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"gorm.io/gorm"

	"oil-gas-service-booking/internal/http-server/handlers"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
)

// NewRouter создает маршруты и применяет авторизацию там, где нужно.
// Параметры: db (GORM) — требуется для middleware авторизации.
func NewRouter(
	db *gorm.DB,
	companyHandler *handlers.CompanyHandler,
	userHandler *handlers.UserHandler,
	bookingHandler *handlers.BookingHandler,
	serviceHandler *handlers.ServiceHandler,
	businessHandler *handlers.BusinessHandler,
	authHandler *handlers.AuthHandler,
) *chi.Mux {

	r := chi.NewRouter()

	// chi middleware
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	// Auth (public)
	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	// Companies
	r.Route("/companies", func(r chi.Router) {
		// Create/Update/Delete — admin only
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", companyHandler.Create)
		r.Get("/", companyHandler.GetAll)
		r.Get("/{id}", companyHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", companyHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", companyHandler.Delete)
	})

	// Services
	r.Route("/services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", serviceHandler.Create)
		r.Get("/", serviceHandler.GetAll)
		r.Get("/{id}", serviceHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", serviceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", serviceHandler.Delete)
	})

	// Users (admin operations)
	r.Route("/users", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", userHandler.Create)
		r.Get("/", userHandler.GetAll)
		r.Get("/{id}", userHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", userHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", userHandler.Delete)
	})

	// Bookings: creation and update — authorized users; listing public
	r.Route("/bookings", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", bookingHandler.Create)
		r.Get("/", bookingHandler.GetAll)
		r.Get("/{id}", bookingHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, false)).Put("/{id}", bookingHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", bookingHandler.Delete) // maybe admin-only delete
	})

	// Business endpoints — only authorized users
	r.Route("/business", func(r chi.Router) {
		r.Use(authmw.BasicAuthMiddleware(db, false))
		r.Get("/companies-by-service/{service}", businessHandler.FindCompaniesByService)
		r.Get("/users-with-active-bookings", businessHandler.FindUsersWithActiveBookings)
		r.Get("/company-stats", businessHandler.GetCompanyStats)
		r.Get("/popular-services", businessHandler.FindPopularServices)
		r.Get("/search", businessHandler.SearchAll)
		r.Get("/system-overview", businessHandler.GetSystemOverview)
	})

	return r
}
