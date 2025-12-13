package handlers

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// POST /auth/register
// Body: { "name": "...", "email": "...", "password": "...", "role": "customer|admin" }
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
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

	// Не возвращаем пароль в ответе
	user.Password = ""
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// POST /auth/login
// Body: { "email": "...", "password": "..." }
// Response: { "token": "<base64(email:password)>" }
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
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

	// Возвращаем Basic token, который клиент может вставлять в заголовок:
	// Authorization: Basic <base64(email:password)>
	token := base64.StdEncoding.EncodeToString([]byte(in.Email + ":" + in.Password))
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// Вспомогательная функция — декодирование токена "Basic <b64>"
func DecodeBasicToken(header string) (email, password string, ok bool) {
	if header == "" || !strings.HasPrefix(header, "Basic ") {
		return "", "", false
	}
	payload, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(header, "Basic "))
	if err != nil {
		return "", "", false
	}
	parts := strings.SplitN(string(payload), ":", 2)
	if len(parts) != 2 {
		return "", "", false
	}
	return parts[0], parts[1], true
}
