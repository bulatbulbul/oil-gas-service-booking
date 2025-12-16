package storage

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"log"
	"oil-gas-service-booking/internal/models"
)

func hashPassword(pw string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(hash)
}

func Seed(db *gorm.DB) error {
	var count int64
	db.Model(&models.Company{}).Count(&count)
	if count > 0 {
		log.Println("Seed: данные уже существуют, пропускаю")
		return nil
	}

	companies := []models.Company{
		{Name: "Газпром сервис"},
		{Name: "Роснефть сервис"},
		{Name: "Лукойл-Тех"},
	}

	if err := db.Create(&companies).Error; err != nil {
		return err
	}

	services := []models.Service{
		{Title: "Диагностика оборудования"},
		{Title: "Ремонт насосов"},
		{Title: "Анализ нефти"},
		{Title: "Промывка трубопровода"},
	}

	if err := db.Create(&services).Error; err != nil {
		return err
	}

	companyServices := []models.CompanyService{
		{CompanyID: companies[0].CompanyID, ServiceID: services[0].ServiceID},
		{CompanyID: companies[0].CompanyID, ServiceID: services[1].ServiceID},
		{CompanyID: companies[1].CompanyID, ServiceID: services[2].ServiceID},
		{CompanyID: companies[2].CompanyID, ServiceID: services[0].ServiceID},
		{CompanyID: companies[2].CompanyID, ServiceID: services[3].ServiceID},
	}

	if err := db.Create(&companyServices).Error; err != nil {
		return err
	}

	pass1, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	pass2, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)

	email1 := "ivan@example.com"
	email2 := "admin@example.com"

	users := []models.User{
		{Name: "Иван", Email: &email1, Password: string(pass1), Role: "customer"},
		{Name: "Админ", Email: &email2, Password: string(pass2), Role: "admin"},
	}

	if err := db.Create(&users).Error; err != nil {
		return err
	}

	desc1 := "Необходима диагностика оборудования"
	booking := models.Booking{
		UserID:      &users[0].UserID,
		Description: &desc1,
		Status:      "requested",
	}

	if err := db.Create(&booking).Error; err != nil {
		return err
	}

	notes := "Срочно выполнить до конца недели"
	bookingService := models.BookingService{
		BookingID:        booking.BookingID,
		CompanyServiceID: companyServices[0].CompanyServiceID,
		Notes:            &notes,
	}

	return db.Create(&bookingService).Error
}
