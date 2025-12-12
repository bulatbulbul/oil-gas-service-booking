package repository

import (
	"oil-gas-service-booking/internal/models"

	"gorm.io/gorm"
)

type CompanyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) *CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) Create(company *models.Company) error {
	return r.db.Create(company).Error
}

func (r *CompanyRepository) GetAll() ([]models.Company, error) {
	var companies []models.Company
	err := r.db.Find(&companies).Error
	return companies, err
}

func (r *CompanyRepository) GetByID(id int64) (*models.Company, error) {
	var company models.Company
	err := r.db.First(&company, id).Error
	if err != nil {
		return nil, err
	}
	return &company, nil
}

func (r *CompanyRepository) Update(company *models.Company) error {
	return r.db.Save(company).Error
}

func (r *CompanyRepository) Delete(id int64) error {
	return r.db.Delete(&models.Company{}, id).Error
}
