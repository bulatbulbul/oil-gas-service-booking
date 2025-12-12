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
	err := r.db.Find(&list).Error
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
