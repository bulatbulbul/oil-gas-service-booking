package repository

import (
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type BookingServiceRepo struct {
	db *gorm.DB
}

func NewBookingServiceRepo(db *gorm.DB) *BookingServiceRepo {
	return &BookingServiceRepo{db: db}
}

func (r *BookingServiceRepo) Create(bs *models.BookingService) error {
	return r.db.Create(bs).Error
}

func (r *BookingServiceRepo) GetAll() ([]models.BookingService, error) {
	var list []models.BookingService
	err := r.db.
		Preload("Booking").
		Preload("CompanyService.Company").
		Preload("CompanyService.Service").
		Find(&list).Error
	return list, err
}

func (r *BookingServiceRepo) GetByID(id int64) (*models.BookingService, error) {
	var bs models.BookingService
	err := r.db.
		Preload("Booking").
		Preload("CompanyService.Company").
		Preload("CompanyService.Service").
		First(&bs, id).Error
	return &bs, err
}

func (r *BookingServiceRepo) GetByBookingID(bookingID int64) ([]models.BookingService, error) {
	var list []models.BookingService
	err := r.db.
		Where("booking_id = ?", bookingID).
		Preload("Booking").
		Preload("CompanyService.Company").
		Preload("CompanyService.Service").
		Find(&list).Error
	return list, err
}

func (r *BookingServiceRepo) Update(bs *models.BookingService) error {
	return r.db.Save(bs).Error
}

func (r *BookingServiceRepo) Delete(id int64) error {
	return r.db.Delete(&models.BookingService{}, id).Error
}

func (r *BookingServiceRepo) DeleteByBookingID(bookingID int64) error {
	return r.db.Where("booking_id = ?", bookingID).Delete(&models.BookingService{}).Error
}
