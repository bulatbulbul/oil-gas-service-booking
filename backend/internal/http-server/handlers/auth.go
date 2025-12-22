package handlers

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"oil-gas-service-booking/internal/models"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type TokenResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
	User  struct {
		ID    int64  `json:"id"`
		Email string `json:"email"`
		Role  string `json:"role"`
	} `json:"user"`
}

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// Register godoc
// @Summary Регистрация пользователя
// @Description Создание нового пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Param data body RegisterRequest true "Данные пользователя"
// @Success 201 {object} TokenResponse
// @Failure 400 {string} string
// @Failure 500 {string} string
// @Router /auth/register [post]
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var in RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if in.Email == "" || in.Password == "" || in.Name == "" {
		http.Error(w, "name, email and password are required", http.StatusBadRequest)
		return
	}

	// Проверяем, есть ли уже пользователь с таким email
	var exists models.User
	if err := h.db.Where("email = ?", in.Email).First(&exists).Error; err == nil {
		http.Error(w, "user with this email already exists", http.StatusBadRequest)
		return
	}

	// Хешируем пароль
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "failed to hash password", http.StatusInternalServerError)
		return
	}

	role := in.Role
	if role == "" {
		role = "customer"
	}
	if role != "customer" && role != "admin" {
		http.Error(w, "role must be 'customer' or 'admin'", http.StatusBadRequest)
		return
	}

	user := models.User{
		Name:     in.Name,
		Email:    &in.Email,
		Password: string(hash),
		Role:     role,
	}

	if err := h.db.Create(&user).Error; err != nil {
		http.Error(w, "failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Генерируем JWT токен (user.UserID уже int64)
	token, err := authmw.GenerateToken(user.UserID, user.Role)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	// Возвращаем токен и данные пользователя (без пароля)
	response := TokenResponse{
		Token: token,
		Role:  user.Role,
		User: struct {
			ID    int64  `json:"id"`
			Email string `json:"email"`
			Role  string `json:"role"`
		}{
			ID:    user.UserID,
			Email: *user.Email,
			Role:  user.Role,
		},
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Login godoc
// @Summary Авторизация
// @Description Вход по email и паролю. Возвращает JWT токен
// @Tags auth
// @Accept json
// @Produce json
// @Param data body LoginRequest true "Email и пароль"
// @Success 200 {object} TokenResponse
// @Failure 401 {string} string
// @Router /auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var in LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if in.Email == "" || in.Password == "" {
		http.Error(w, "email and password required", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", in.Email).First(&user).Error; err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	// Сравниваем хеш пароля
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(in.Password)); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	// Генерируем JWT токен (user.UserID уже int64)
	token, err := authmw.GenerateToken(user.UserID, user.Role)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	// Возвращаем токен и данные пользователя
	response := TokenResponse{
		Token: token,
		Role:  user.Role,
		User: struct {
			ID    int64  `json:"id"`
			Email string `json:"email"`
			Role  string `json:"role"`
		}{
			ID:    user.UserID,
			Email: *user.Email,
			Role:  user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Me godoc
// @Summary Текущий пользователь
// @Description Возвращает данные текущего пользователя по JWT
// @Tags auth
// @Security BasicAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {string} string
// @Router /auth/me [get]
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.UserID,
		"name":  user.Name,
		"email": user.Email, // это *string, нормально отдастся как строка/ null
		"role":  role,
	})
}
