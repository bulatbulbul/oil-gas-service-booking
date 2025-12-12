package router

import (
	"github.com/go-chi/chi/v5"
	"oil-gas-service-booking/internal/http-server/handlers"
)

func NewRouter(
	companyHandler *handlers.CompanyHandler,
	userHandler *handlers.UserHandler,
	bookingHandler *handlers.BookingHandler,
	serviceHandler *handlers.ServiceHandler,
) *chi.Mux {
	r := chi.NewRouter()

	// Companies
	r.Route("/companies", func(r chi.Router) {
		r.Post("/", companyHandler.Create)
		r.Get("/", companyHandler.GetAll)
		r.Get("/{id}", companyHandler.GetByID)
		r.Put("/{id}", companyHandler.Update)
		r.Delete("/{id}", companyHandler.Delete)
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

		// Дополнительный эндпоинт для изменения статуса
		r.Patch("/{id}/status", bookingHandler.UpdateStatus)
	})

	// Services
	r.Route("/services", func(r chi.Router) {
		r.Post("/", serviceHandler.Create)
		r.Get("/", serviceHandler.GetAll)
		r.Get("/{id}", serviceHandler.GetByID)
		r.Put("/{id}", serviceHandler.Update)
		r.Delete("/{id}", serviceHandler.Delete)
	})

	return r
}
