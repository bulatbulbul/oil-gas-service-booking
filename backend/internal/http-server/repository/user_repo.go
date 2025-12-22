package repository

import (
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Create(u *models.User) error {
	return r.db.Create(u).Error
}

func (r *UserRepo) GetAll() ([]models.User, error) {
	var list []models.User
	err := r.db.Find(&list).Error
	return list, err
}

func (r *UserRepo) GetByID(id int64) (*models.User, error) {
	var u models.User
	err := r.db.First(&u, id).Error
	return &u, err
}

func (r *UserRepo) Update(u *models.User) error {
	return r.db.Save(u).Error
}

func (r *UserRepo) Delete(id int64) error {
	return r.db.Delete(&models.User{}, id).Error
}
