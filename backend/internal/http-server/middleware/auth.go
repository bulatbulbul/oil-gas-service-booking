package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

// ctx keys
type ctxKey string

const (
	ctxUserIDKey ctxKey = "user_id"
	ctxRoleKey   ctxKey = "role"
)

// Claims для JWT токена
type Claims struct {
	UserID int64  `json:"user_id"` // int64 вместо uint
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// JWT Secret (в продакшене вынести в переменные окружения)
var jwtSecret = []byte("your-super-secret-jwt-key-change-in-production")

// GenerateToken создаёт JWT токен для пользователя
func GenerateToken(userID int64, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// validateToken проверяет JWT токен и возвращает claims
func validateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}

// BasicAuthMiddleware проверяет JWT токен из заголовка Authorization: Bearer <token>
func BasicAuthMiddleware(db *gorm.DB, adminOnly bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "Bearer token required", http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := validateToken(tokenString)
			if err != nil {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Проверяем пользователя в БД
			var user models.User
			if err := db.First(&user, claims.UserID).Error; err != nil {
				http.Error(w, "User not found", http.StatusUnauthorized)
				return
			}

			// Проверяем роль
			if adminOnly && user.Role != "admin" {
				http.Error(w, "Admin access required", http.StatusForbidden)
				return
			}

			ctx := context.WithValue(r.Context(), ctxUserIDKey, user.UserID)
			ctx = context.WithValue(ctx, ctxRoleKey, user.Role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext возвращает userID и роль из контекста (int64 вместо uint)
func GetUserFromContext(r *http.Request) (userID int64, role string, ok bool) {
	uid, ok1 := r.Context().Value(ctxUserIDKey).(int64) // int64 вместо uint
	rl, ok2 := r.Context().Value(ctxRoleKey).(string)
	if !ok1 || !ok2 {
		return 0, "", false
	}
	return uid, rl, true
}
