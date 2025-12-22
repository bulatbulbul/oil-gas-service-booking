package storage

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"oil-gas-service-booking/internal/models"
)

func NewGorm(dsn string) (*gorm.DB, error) {
	connStr := "file:" + dsn + "?_foreign_keys=on"

	sqlDB, err := sql.Open("sqlite", connStr)
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %w", err)
	}
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	if err := sqlDB.Ping(); err != nil {
		sqlDB.Close()
		return nil, fmt.Errorf("sqlDB.Ping: %w", err)
	}

	gormDB, err := gorm.Open(sqlite.Dialector{Conn: sqlDB}, &gorm.Config{})
	if err != nil {
		sqlDB.Close()
		return nil, fmt.Errorf("gorm.Open: %w", err)
	}

	// Миграции
	if err := gormDB.AutoMigrate(
		&models.User{},
		&models.Company{},
		&models.Service{},
		&models.CompanyService{},
		&models.Booking{},
		&models.BookingService{},
	); err != nil {
		sqlDB.Close()
		return nil, fmt.Errorf("automigrate: %w", err)
	}

	// ВЫЗОВ SEED
	if err := Seed(gormDB); err != nil {
		return nil, fmt.Errorf("seed data: %w", err)
	}

	return gormDB, nil
}
