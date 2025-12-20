package repository

import (
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type CompanyServiceRepo struct {
	db *gorm.DB
}

func NewCompanyServiceRepo(db *gorm.DB) *CompanyServiceRepo {
	return &CompanyServiceRepo{db: db}
}

func (r *CompanyServiceRepo) Create(cs *models.CompanyService) error {
	return r.db.Create(cs).Error
}

func (r *CompanyServiceRepo) GetAll() ([]models.CompanyService, error) {
	var list []models.CompanyService
	err := r.db.
		Preload("Company").
		Preload("Service").
		Find(&list).Error
	return list, err
}

func (r *CompanyServiceRepo) GetByID(id int64) (*models.CompanyService, error) {
	var cs models.CompanyService
	err := r.db.
		Preload("Company").
		Preload("Service").
		First(&cs, id).Error
	return &cs, err
}

func (r *CompanyServiceRepo) GetByCompanyID(companyID int64) ([]models.CompanyService, error) {
	var list []models.CompanyService
	err := r.db.
		Where("company_id = ?", companyID).
		Preload("Company").
		Preload("Service").
		Find(&list).Error
	return list, err
}

func (r *CompanyServiceRepo) GetByServiceID(serviceID int64) ([]models.CompanyService, error) {
	var list []models.CompanyService
	err := r.db.
		Where("service_id = ?", serviceID).
		Preload("Company").
		Preload("Service").
		Find(&list).Error
	return list, err
}

func (r *CompanyServiceRepo) GetByCompanyAndService(companyID, serviceID int64) (*models.CompanyService, error) {
	var cs models.CompanyService
	err := r.db.
		Where("company_id = ? AND service_id = ?", companyID, serviceID).
		Preload("Company").
		Preload("Service").
		First(&cs).Error
	return &cs, err
}

func (r *CompanyServiceRepo) Update(cs *models.CompanyService) error {
	return r.db.Save(cs).Error
}

func (r *CompanyServiceRepo) Delete(id int64) error {
	return r.db.Delete(&models.CompanyService{}, id).Error
}

func (r *CompanyServiceRepo) DeleteByCompanyID(companyID int64) error {
	return r.db.Where("company_id = ?", companyID).Delete(&models.CompanyService{}).Error
}

func (r *CompanyServiceRepo) DeleteByServiceID(serviceID int64) error {
	return r.db.Where("service_id = ?", serviceID).Delete(&models.CompanyService{}).Error
}
