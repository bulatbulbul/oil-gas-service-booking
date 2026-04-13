package main

import (
	"log"
	"net/http"
	"strings"

	httpSwagger "github.com/swaggo/http-swagger/v2"

	_ "oil-gas-service-booking/docs"

	"oil-gas-service-booking/internal/config"
	"oil-gas-service-booking/internal/http-server/handlers"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"oil-gas-service-booking/internal/http-server/repository"
	"oil-gas-service-booking/internal/http-server/router"
	"oil-gas-service-booking/internal/storage"

	docs "oil-gas-service-booking/docs"
)

// @title Oil & Gas Service Booking API
// @version 1.0
// @host localhost:8082
// @BasePath /
// @securityDefinitions.basic BasicAuth
func main() {
	cfg := config.MustLoad()

	authmw.SetJWTSecret(cfg.JWTSecret)

	db, err := storage.NewGorm(cfg.Storage)
	if err != nil {
		log.Fatalf("Ошибка базы данных: %v", err)
	}

	companyRepo := repository.NewCompanyRepository(db)
	userRepo := repository.NewUserRepo(db)
	bookingRepo := repository.NewBookingRepo(db)
	serviceRepo := repository.NewServiceRepo(db)
	businessRepo := repository.NewBusinessRepo(db)
	bookingServiceRepo := repository.NewBookingServiceRepo(db)
	companyServiceRepo := repository.NewCompanyServiceRepo(db)

	uploadsDir := "./uploads"

	companyHandler := handlers.NewCompanyHandler(companyRepo)
	userHandler := handlers.NewUserHandler(userRepo)
	bookingHandler := handlers.NewBookingHandler(bookingRepo)
	serviceHandler := handlers.NewServiceHandler(serviceRepo, companyRepo, companyServiceRepo)
	businessHandler := handlers.NewBusinessHandler(businessRepo)
	authHandler := handlers.NewAuthHandler(db)
	bookingServiceHandler := handlers.NewBookingServiceHandler(bookingServiceRepo)
	companyServiceHandler := handlers.NewCompanyServiceHandler(companyServiceRepo, companyRepo)
	uploadHandler := handlers.NewUploadHandler(db, uploadsDir)
	serviceRequestHandler := handlers.NewServiceRequestHandler(db)

	r := router.NewRouter(
		companyHandler,
		userHandler,
		bookingHandler,
		serviceHandler,
		businessHandler,
		authHandler,
		bookingServiceHandler,
		companyServiceHandler,
		uploadHandler,
		uploadsDir,
		serviceRequestHandler,
	)

	host := cfg.HTTPServer.Address
	if strings.HasPrefix(host, ":") {
		host = "localhost" + host
	}

	docs.SwaggerInfo.Host = host
	docs.SwaggerInfo.BasePath = "/"
	docs.SwaggerInfo.Title = "Oil & Gas Service Booking API"
	docs.SwaggerInfo.Version = "1.0"

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("http://"+host+"/swagger/doc.json"),
	))

	log.Printf("Сервер запущен на %s", cfg.HTTPServer.Address)
	if err := http.ListenAndServe(cfg.HTTPServer.Address, r); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
