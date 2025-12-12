package repository

import (
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type ServiceRepo struct {
	db *gorm.DB
}

func NewServiceRepo(db *gorm.DB) *ServiceRepo {
	return &ServiceRepo{db: db}
}

func (r *ServiceRepo) Create(service *models.Service) error {
	return r.db.Create(service).Error
}

func (r *ServiceRepo) GetAll() ([]models.Service, error) {
	var services []models.Service
	err := r.db.Find(&services).Error
	return services, err
}

func (r *ServiceRepo) GetByID(id int64) (*models.Service, error) {
	var service models.Service
	err := r.db.First(&service, id).Error
	return &service, err
}

func (r *ServiceRepo) Update(service *models.Service) error {
	return r.db.Save(service).Error
}

func (r *ServiceRepo) Delete(id int64) error {
	return r.db.Delete(&models.Service{}, id).Error
}
