package main

import (
	"fmt"
	"log"
	"oil-gas-service-booking/internal/config"
	"oil-gas-service-booking/internal/storage"
)

func main() {
	cfg := config.MustLoad()
	fmt.Printf("%+v\n", cfg)

	gdb, err := storage.NewGorm(cfg.Storage)
	if err != nil {
		log.Fatalf("failed to init gorm: %v", err)
	}
	sqlDB, err := gdb.DB()
	if err != nil {
		log.Fatalf("gorm.DB(): %v", err)
	}
	defer sqlDB.Close()

	log.Println("GORM DB ready (migrations applied)")
	_ = gdb
}
