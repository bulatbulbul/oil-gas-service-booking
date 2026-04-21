package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"oil-gas-service-booking/internal/http-server/handlers"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
)

func NewRouter(
	companyHandler *handlers.CompanyHandler,
	userHandler *handlers.UserHandler,
	bookingHandler *handlers.BookingHandler,
	serviceHandler *handlers.ServiceHandler,
	businessHandler *handlers.BusinessHandler,
	authHandler *handlers.AuthHandler,
	bookingServiceHandler *handlers.BookingServiceHandler,
	companyServiceHandler *handlers.CompanyServiceHandler,
	uploadHandler *handlers.UploadHandler,
	uploadsDir string,
	serviceRequestHandler *handlers.ServiceRequestHandler,
	notificationHandler *handlers.NotificationHandler,
) *chi.Mux {

	r := chi.NewRouter()

	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
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

	r.With(authmw.BasicAuthMiddleware(false)).Get("/auth/me", authHandler.Me)
	r.With(authmw.BasicAuthMiddleware(false)).Patch("/auth/me", authHandler.UpdateMe)
	r.With(authmw.BasicAuthMiddleware(false)).Get("/auth/me/stats", authHandler.MyStats)

	// ------------ COMPANIES (любой залогиненный) ------------
	// companies
	r.Route("/companies", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Post("/", companyHandler.Create)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/", companyHandler.GetAll)  // все компании
		r.With(authmw.BasicAuthMiddleware(false)).Get("/my", companyHandler.GetMy) // ✅ только мои
		r.With(authmw.BasicAuthMiddleware(false)).Get("/{id}", companyHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/{id}", companyHandler.Update)
		r.With(authmw.BasicAuthMiddleware(false)).Delete("/{id}", companyHandler.Delete)
	})

	// services
	r.Route("/services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Post("/", serviceHandler.Create)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/", serviceHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/available", serviceHandler.GetAvailable)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/my", serviceHandler.GetMy)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/{id}", serviceHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/{id}", serviceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(false)).Delete("/{id}", serviceHandler.Delete)
	})

	// ------------ USERS (только admin) ------------
	r.Route("/users", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(true)).Get("/", userHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(true)).Delete("/{id}", userHandler.Delete)
	})

	// ------------ BOOKINGS ------------
	r.Route("/bookings", func(r chi.Router) {
		// создать бронирование: любой залогиненный
		r.With(authmw.BasicAuthMiddleware(false)).Post("/", bookingHandler.Create)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/me", bookingHandler.GetMyBookings)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/company", bookingHandler.GetMyCompanyBookings)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/{id}/cancel", bookingHandler.CancelMy)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/{id}/company-status", bookingHandler.UpdateMyCompanyBookingStatus)
		r.With(authmw.BasicAuthMiddleware(false)).Delete("/{id}/me", bookingHandler.DeleteMy)

		// полный доступ: только admin
		r.With(authmw.BasicAuthMiddleware(true)).Get("/", bookingHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/{id}", bookingHandler.GetByID)
		r.With(authmw.BasicAuthMiddleware(true)).Put("/{id}", bookingHandler.Update)
		r.With(authmw.BasicAuthMiddleware(true)).Delete("/{id}", bookingHandler.Delete)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/{booking_id}/services", bookingServiceHandler.GetByBookingID)
	})

	// ------------ BOOKING-SERVICES ------------
	r.Route("/booking-services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Post("/", bookingServiceHandler.Create)
	})

	// ------------ COMPANY-SERVICES (любой залогиненный) ------------
	r.Route("/company-services", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Get("/my", companyServiceHandler.GetMy)
		r.With(authmw.BasicAuthMiddleware(false)).Post("/", companyServiceHandler.Create)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/{id}", companyServiceHandler.Update)
		r.With(authmw.BasicAuthMiddleware(false)).Delete("/{id}", companyServiceHandler.Delete)
	})

	// ------------ UPLOAD ------------
	r.Route("/upload", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Post("/avatar", uploadHandler.UploadAvatar)
		r.With(authmw.BasicAuthMiddleware(false)).Post("/companies/{id}/logo", uploadHandler.UploadCompanyLogo)
	})

	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))))

	// ------------ SERVICE REQUESTS ------------
	r.Route("/service-requests", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Post("/", serviceRequestHandler.Create)
		r.With(authmw.BasicAuthMiddleware(false)).Post("/{id}/respond", serviceRequestHandler.Respond)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/", serviceRequestHandler.GetAll)
		r.With(authmw.BasicAuthMiddleware(true)).Put("/{id}/status", serviceRequestHandler.UpdateStatus)
		r.With(authmw.BasicAuthMiddleware(true)).Post("/{id}/notify-companies", serviceRequestHandler.NotifyCompanies)
	})

	// ------------ NOTIFICATIONS ------------
	r.Route("/notifications", func(r chi.Router) {
		r.With(authmw.BasicAuthMiddleware(false)).Get("/", notificationHandler.GetMy)
		r.With(authmw.BasicAuthMiddleware(false)).Get("/unread-count", notificationHandler.UnreadCount)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/{id}/read", notificationHandler.MarkRead)
		r.With(authmw.BasicAuthMiddleware(false)).Put("/read-all", notificationHandler.MarkAllRead)
		r.With(authmw.BasicAuthMiddleware(false)).Delete("/{id}", notificationHandler.Delete)
	})

	// ------------ BUSINESS (аналитика) ------------
	r.Route("/business", func(r chi.Router) {
		// поиск компаний по услуге: любой залогиненный
		r.With(authmw.BasicAuthMiddleware(false)).Get("/companies-by-service/{serviceId}", businessHandler.FindCompaniesByService)

		// аналитика: только admin
		r.With(authmw.BasicAuthMiddleware(true)).Get("/users-with-active-bookings", businessHandler.FindUsersWithActiveBookings)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/company-stats", businessHandler.GetCompanyStats)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/popular-services", businessHandler.FindPopularServices)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/popular-companies", businessHandler.FindPopularCompanies)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/summary", businessHandler.GetSummary)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/bookings-by-date", businessHandler.GetBookingsByDate)
		r.With(authmw.BasicAuthMiddleware(true)).Get("/search", businessHandler.SearchAll)
	})

	return r
}
