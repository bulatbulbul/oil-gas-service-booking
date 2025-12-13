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
		log.Fatalf("Ошибка базы данных: %v", err)
	}

	// Инициализируем репозитории
	companyRepo := repository.NewCompanyRepository(db)
	userRepo := repository.NewUserRepo(db)
	bookingRepo := repository.NewBookingRepo(db)
	serviceRepo := repository.NewServiceRepo(db)
	businessRepo := repository.NewBusinessRepo(db)

	// Инициализируем хендлеры
	companyHandler := handlers.NewCompanyHandler(companyRepo)
	userHandler := handlers.NewUserHandler(userRepo)
	bookingHandler := handlers.NewBookingHandler(bookingRepo)
	serviceHandler := handlers.NewServiceHandler(serviceRepo)
	businessHandler := handlers.NewBusinessHandler(businessRepo)

	// Auth handler (register/login)
	authHandler := handlers.NewAuthHandler(db)

	// Создаем роутер
	r := router.NewRouter(
		db,
		companyHandler,
		userHandler,
		bookingHandler,
		serviceHandler,
		businessHandler,
		authHandler,
	)

	// Запускаем сервер
	log.Printf("Сервер запущен на %s", cfg.HTTPServer.Address)
	if err := http.ListenAndServe(cfg.HTTPServer.Address, r); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
