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

	var exists models.User
	if err := h.db.Where("email = ?", in.Email).First(&exists).Error; err == nil {
		http.Error(w, "user with this email already exists", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "failed to hash password", http.StatusInternalServerError)
		return
	}

	role := "customer"

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

	token, err := authmw.GenerateToken(user.UserID, user.Role)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

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

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(in.Password)); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := authmw.GenerateToken(user.UserID, user.Role)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

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
		"id":         user.UserID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       role,
		"avatar_url": user.AvatarURL,
	})
}

func (h *AuthHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var in struct {
		Name  string  `json:"name"`
		Email *string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updates := map[string]interface{}{}
	if in.Name != "" {
		updates["name"] = in.Name
	}
	if in.Email != nil {
		updates["email"] = in.Email
	}

	if len(updates) == 0 {
		http.Error(w, "nothing to update", http.StatusBadRequest)
		return
	}

	if err := h.db.Model(&models.User{}).Where("user_id = ?", userID).Updates(updates).Error; err != nil {
		http.Error(w, "failed to update user", http.StatusInternalServerError)
		return
	}

	var user models.User
	h.db.First(&user, userID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.UserID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       role,
		"avatar_url": user.AvatarURL,
	})
}

func (h *AuthHandler) MyStats(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var total, active, completed int64
	h.db.Model(&models.Booking{}).Where("user_id = ?", userID).Count(&total)
	h.db.Model(&models.Booking{}).Where("user_id = ? AND status IN ?", userID, []string{"requested", "approved"}).Count(&active)
	h.db.Model(&models.Booking{}).Where("user_id = ? AND status = ?", userID, "completed").Count(&completed)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_bookings":     total,
		"active_bookings":    active,
		"completed_bookings": completed,
	})
}
