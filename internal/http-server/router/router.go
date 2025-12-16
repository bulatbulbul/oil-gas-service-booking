package router

import (
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"gorm.io/gorm"

	"oil-gas-service-booking/internal/http-server/handlers"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
)

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

	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	r.Route("/companies", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", companyHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/", companyHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{id}", companyHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", companyHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", companyHandler.Delete)
	})

	r.Route("/services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", serviceHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/", serviceHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{id}", serviceHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", serviceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", serviceHandler.Delete)
	})

	r.Route("/users", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", userHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", userHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", userHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", userHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", userHandler.Delete)
	})

	r.Route("/bookings", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", bookingHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", bookingHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", bookingHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", bookingHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", bookingHandler.Delete)
	})

	r.Route("/business", func(r chi.Router) {
		r.Use(authmw.BasicAuthMiddleware(db, true))
		r.Get("/companies-by-service/{service}", businessHandler.FindCompaniesByService)
		r.Get("/users-with-active-bookings", businessHandler.FindUsersWithActiveBookings)
		r.Get("/company-stats", businessHandler.GetCompanyStats)
		r.Get("/popular-services", businessHandler.FindPopularServices)
		r.Get("/search", businessHandler.SearchAll)
	})

	return r
}
