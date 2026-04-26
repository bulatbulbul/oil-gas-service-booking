package repository

import (
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type BookingRepo struct {
	db *gorm.DB
}

func NewBookingRepo(db *gorm.DB) *BookingRepo {
	return &BookingRepo{db: db}
}

func (r *BookingRepo) Create(b *models.Booking) error {
	return r.db.Create(b).Error
}

func (r *BookingRepo) GetAll() ([]models.Booking, error) {
	var list []models.Booking
	err := r.db.
		Preload("User").
		Preload("BookingServices.CompanyService.Company").
		Preload("BookingServices.CompanyService.Service").
		Order("created_at DESC").
		Find(&list).Error
	return list, err
}

func (r *BookingRepo) GetByID(id int64) (*models.Booking, error) {
	var b models.Booking
	err := r.db.First(&b, id).Error
	return &b, err
}

func (r *BookingRepo) Update(b *models.Booking) error {
	return r.db.Save(b).Error
}

func (r *BookingRepo) Delete(id int64) error {
	return r.db.Delete(&models.Booking{}, id).Error
}

func (r *BookingRepo) GetByUserID(userID int64) ([]models.Booking, error) {
	var bookings []models.Booking

	err := r.db.
		Where("user_id = ?", userID).
		Preload("BookingServices.CompanyService.Company").
		Preload("BookingServices.CompanyService.Service").
		Find(&bookings).Error

	return bookings, err
}

func (r *BookingRepo) UpdateStatus(bookingID int64, status string) error {
	return r.db.
		Model(&models.Booking{}).
		Where("booking_id = ?", bookingID).
		Update("status", status).Error
}

func (r *BookingRepo) GetByCompanyOwner(ownerUserID int64) ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.db.
		Distinct("booking.*").
		Joins("JOIN booking_service ON booking_service.booking_id = booking.booking_id").
		Joins("JOIN company_service ON company_service.company_service_id = booking_service.company_service_id").
		Joins("JOIN company ON company.company_id = company_service.company_id").
		Where("company.user_id = ?", ownerUserID).
		Preload("User").
		Preload("BookingServices.CompanyService.Company").
		Preload("BookingServices.CompanyService.Service").
		Find(&bookings).Error
	return bookings, err
}

func (r *BookingRepo) IsBookingOwnedByCompanyOwner(bookingID, ownerUserID int64) (bool, error) {
	var count int64
	err := r.db.
		Model(&models.BookingService{}).
		Joins("JOIN company_service ON company_service.company_service_id = booking_service.company_service_id").
		Joins("JOIN company ON company.company_id = company_service.company_id").
		Where("booking_service.booking_id = ? AND company.user_id = ?", bookingID, ownerUserID).
		Count(&count).Error
	return count > 0, err
}
