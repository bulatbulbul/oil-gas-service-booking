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
	bookingServiceHandler *handlers.BookingServiceHandler,
	companyServiceHandler *handlers.CompanyServiceHandler,
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

	// ------------ AUTH (public) ------------
	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	r.With(authmw.BasicAuthMiddleware(db, false)).Get("/auth/me", authHandler.Me)

	// ------------ COMPANIES (любой залогиненный) ------------
	// companies
	r.Route("/companies", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", companyHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/", companyHandler.GetAll)  // все компании
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/my", companyHandler.GetMy) // ✅ только мои
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{id}", companyHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, false)).Put("/{id}", companyHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, false)).Delete("/{id}", companyHandler.Delete)
	})

	// services
	r.Route("/services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", serviceHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/", serviceHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/my", serviceHandler.GetMy)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/{id}", serviceHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, false)).Put("/{id}", serviceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, false)).Delete("/{id}", serviceHandler.Delete)
	})

	// ------------ USERS (только admin) ------------
	r.Route("/users", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, true)).Post("/", userHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", userHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", userHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", userHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", userHandler.Delete)
	})

	// ------------ BOOKINGS ------------
	r.Route("/bookings", func(r chi.Router) {
		// создать бронирование: любой залогиненный
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", bookingHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/me", bookingHandler.GetMyBookings)
		r.With(authmw.BasicAuthMiddleware(db, false)).Delete("/{id}/me", bookingHandler.DeleteMy)

		// полный доступ: только admin
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", bookingHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", bookingHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", bookingHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", bookingHandler.Delete)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{booking_id}/services", bookingServiceHandler.GetByBookingID)
	})

	// ------------ BOOKING-SERVICES ------------
	r.Route("/booking-services", func(r chi.Router) {
		// привязать услугу к бронированию: любой залогиненный
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", bookingServiceHandler.Create)

		// полный доступ: только admin
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", bookingServiceHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", bookingServiceHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(db, true)).Put("/{id}", bookingServiceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, true)).Delete("/{id}", bookingServiceHandler.Delete)
	})

	// ------------ COMPANY-SERVICES (любой залогиненный) ------------
	r.Route("/company-services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/my", companyServiceHandler.GetMy)
		// любой customer может привязывать услуги к СВОИМ компаниям
		r.With(authmw.BasicAuthMiddleware(db, false)).Post("/", companyServiceHandler.Create)
		r.With(authmw.BasicAuthMiddleware(db, false)).Put("/{id}", companyServiceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(db, false)).Delete("/{id}", companyServiceHandler.Delete)

		// полный список: только admin
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/", companyServiceHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/{id}", companyServiceHandler.GetByID)
	})

	// ------------ BUSINESS (аналитика) ------------
	r.Route("/business", func(r chi.Router) {
		// поиск компаний по услуге: любой залогиненный
		r.With(authmw.BasicAuthMiddleware(db, false)).Get("/companies-by-service/{service}", businessHandler.FindCompaniesByService)

		// аналитика: только admin
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/users-with-active-bookings", businessHandler.FindUsersWithActiveBookings)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/company-stats", businessHandler.GetCompanyStats)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/popular-services", businessHandler.FindPopularServices)
		r.With(authmw.BasicAuthMiddleware(db, true)).Get("/search", businessHandler.SearchAll)
	})

	return r
}
