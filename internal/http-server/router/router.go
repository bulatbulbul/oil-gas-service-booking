package router

import (
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
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
	bookingServiceHandler *handlers.BookingServiceHandler, // Добавлено
	companyServiceHandler *handlers.CompanyServiceHandler, // Добавлено
) *chi.Mux {

	r := chi.NewRouter()

	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

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

		// Вложенный маршрут для получения услуг компании
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{company_id}/services", companyServiceHandler.GetByCompanyID)
	})

	r.Route("/services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", serviceHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/", serviceHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{id}", serviceHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", serviceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", serviceHandler.Delete)

		// Вложенный маршрут для получения компаний, предоставляющих услугу
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{service_id}/companies", companyServiceHandler.GetByServiceID)
	})

	r.Route("/users", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", userHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", userHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", userHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", userHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", userHandler.Delete)
	})

	r.Route("/bookings", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", bookingHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", bookingHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", bookingHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", bookingHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", bookingHandler.Delete)

		// новое:
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/me", bookingHandler.GetMyBookings)

		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{booking_id}/services", bookingServiceHandler.GetByBookingID)
	})

	r.Route("/booking-services", func(r chi.Router) {
		r.Use(authmw.BasicAuthMiddleware(db, true))
		r.Post("/", bookingServiceHandler.Create)
		r.Get("/", bookingServiceHandler.GetAll)
		r.Get("/{id}", bookingServiceHandler.GetByID)
		r.Put("/{id}", bookingServiceHandler.Update)
		r.Delete("/{id}", bookingServiceHandler.Delete)
	})

	r.Route("/company-services", func(r chi.Router) {
		r.Use(authmw.BasicAuthMiddleware(db, true))
		r.Post("/", companyServiceHandler.Create)
		r.Get("/", companyServiceHandler.GetAll)
		r.Get("/{id}", companyServiceHandler.GetByID)
		r.Put("/{id}", companyServiceHandler.Update)
		r.Delete("/{id}", companyServiceHandler.Delete)
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
