package main

import (
	"fmt"
	"log"
	"oil-gas-service-booking/internal/config"
	"oil-gas-service-booking/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	_ "modernc.org/sqlite" // драйвер без CGO
)

func main() {

	// мб фреймворком нужно подумать каким

	// примерный план
	// TODO init config (yaml нврн)
	cfg := config.MustLoad()
	fmt.Println(cfg)

	// TODO init logger: slog  (мб не надо)

	// TODO init storage: сначала sqlite потом перейду на postgresql

	db, err := gorm.Open(sqlite.Open("file:storage/storage.db?_foreign_keys=on"), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}

	log.Println("Database opened successfully!")

	if err := db.AutoMigrate(&models.Company{}, &models.Service{}, &models.Booking{}); err != nil {
		log.Fatalf("migrate failed: %v", err)
	}
	fmt.Println("Database migration completed successfully!")

	// TODO init router (вроде надо)

	// TODO run server
}
