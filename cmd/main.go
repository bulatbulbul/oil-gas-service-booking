package main

import (
	"log"
	"net/http"

	"oil-gas-service-booking/internal/config"
	"oil-gas-service-booking/internal/http-server/handlers"
	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/http-server/router"
	"oil-gas-service-booking/internal/storage"
)

func main() {
	// Загружаем конфигурацию
	cfg := config.MustLoad()

	// Инициализируем базу данных
	db, err := storage.NewGorm(cfg.Storage)
	if err != nil {
		log.Fatalf("storage error: %v", err)
	}

	// Инициализируем репозитории
	companyRepo := repository.NewCompanyRepository(db)
	userRepo := repository.NewUserRepo(db)
	bookingRepo := repository.NewBookingRepo(db)
	serviceRepo := repository.NewServiceRepo(db) // Нужно создать этот репозиторий

	// Инициализируем хендлеры
	companyHandler := handlers.NewCompanyHandler(companyRepo)
	userHandler := handlers.NewUserHandler(userRepo)
	bookingHandler := handlers.NewBookingHandler(bookingRepo)
	serviceHandler := handlers.NewServiceHandler(serviceRepo)

	// Создаем роутер со всеми хендлерами
	r := router.NewRouter(companyHandler, userHandler, bookingHandler, serviceHandler)

	// Логируем запуск сервера
	log.Printf("Server starting on %s", cfg.Address)

	// Запускаем сервер
	if err := http.ListenAndServe(cfg.Address, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
