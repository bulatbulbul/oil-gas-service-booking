package storage

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"

	// Драйвер GORM для SQLite (обертка над database/sql)
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	// Модели базы данных нашего приложения
	"oil-gas-service-booking/internal/models"
)

// NewGorm создает и возвращает подключение *gorm.DB к базе данных SQLite
// Использует драйвер modernc.org/sqlite через стандартный database/sql,
// а затем оборачивает соединение в GORM
//
// Параметры:
//
//	dsn - строка подключения к базе данных (путь к файлу), например: "storage/storage.db"
//
// Возвращает:
//
//	*gorm.DB - подключение GORM для работы с базой данных
//	error - ошибка, если что-то пошло не так
func NewGorm(dsn string) (*gorm.DB, error) {
	// Формируем строку подключения для SQLite
	// "file:" - префикс для указания файловой базы данных
	// "_foreign_keys=on" - включаем поддержку внешних ключей (важно для целостности данных)
	connStr := "file:" + dsn + "?_foreign_keys=on"

	// Открываем соединение через стандартный database/sql с драйвером modernc.org/sqlite
	sqlDB, err := sql.Open("sqlite", connStr)
	if err != nil {
		// Возвращаем ошибку с контекстом для удобства отладки
		return nil, fmt.Errorf("sql.Open: %w", err)
	}

	// Настройки пула соединений для SQLite:
	// SQLite не поддерживает конкурентные запросы на запись, поэтому
	// рекомендуется использовать только одно соединение
	sqlDB.SetMaxOpenConns(1)

	// Устанавливаем максимальное время простоя соединения
	// Соединения, простаивающие дольше 5 минут, будут закрыты
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	// Проверяем, что соединение с базой данных действительно работает
	// Ping отправляет простой запрос к БД для проверки доступности
	if err := sqlDB.Ping(); err != nil {
		// Закрываем соединение при ошибке (чтобы не оставлять открытых дескрипторов)
		sqlDB.Close()
		return nil, fmt.Errorf("sqlDB.Ping: %w", err)
	}

	// Создаем подключение GORM, используя существующее соединение *sql.DB
	// Это позволяет GORM работать с тем же соединением, что мы создали выше
	gormDB, err := gorm.Open(sqlite.Dialector{Conn: sqlDB}, &gorm.Config{})
	if err != nil {
		// Закрываем соединение database/sql при ошибке инициализации GORM
		sqlDB.Close()
		return nil, fmt.Errorf("gorm.Open: %w", err)
	}

	// Автоматическое создание/обновление таблиц в базе данных
	// GORM анализирует структуры моделей и создает соответствующие таблицы,
	// если они еще не существуют, или обновляет их схему при необходимости
	if err := gormDB.AutoMigrate(
		&models.Company{},        // Таблица компаний
		&models.Service{},        // Таблица услуг
		&models.CompanyService{}, // Таблица связи компаний и услуг (many-to-many)
		&models.User{},           // Таблица пользователей
		&models.Booking{},        // Таблица бронирований
		&models.BookingService{}, // Таблица связи бронирований и услуг (many-to-many)
	); err != nil {
		// В случае ошибки миграции закрываем соединение с БД
		sqlDB.Close()
		return nil, fmt.Errorf("automigrate: %w", err)
	}

	if err := Seed(gormDB); err != nil {
		return nil, fmt.Errorf("seed data: %w", err)
	}

	// Возвращаем успешно созданное подключение GORM
	return gormDB, nil
}
