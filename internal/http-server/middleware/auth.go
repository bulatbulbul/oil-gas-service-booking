package middleware

import (
	"context"
	"encoding/base64"
	"net/http"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

// ctx keys
type ctxKey string

const (
	ctxUserIDKey ctxKey = "user_id"
	ctxRoleKey   ctxKey = "role"
)

// BasicAuthMiddleware проверяет заголовок Authorization (Basic) и
// при успешной проверке добавляет в контекст user_id и role.
// Если adminOnly == true — требует роль "admin".
func BasicAuthMiddleware(db *gorm.DB, adminOnly bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Basic ") {
				w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
				http.Error(w, "authorization required", http.StatusUnauthorized)
				return
			}

			// decode base64
			payload, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(authHeader, "Basic "))
			if err != nil {
				http.Error(w, "invalid authorization", http.StatusUnauthorized)
				return
			}
			parts := strings.SplitN(string(payload), ":", 2)
			if len(parts) != 2 {
				http.Error(w, "invalid authorization", http.StatusUnauthorized)
				return
			}
			email := parts[0]
			password := parts[1]

			var user models.User
			if err := db.Where("email = ?", email).First(&user).Error; err != nil {
				http.Error(w, "invalid credentials", http.StatusUnauthorized)
				return
			}

			// сравниваем хешированный пароль
			if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
				http.Error(w, "invalid credentials", http.StatusUnauthorized)
				return
			}

			// проверка роли
			if adminOnly && user.Role != "admin" {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}

			// помещаем user info в контекст
			ctx := context.WithValue(r.Context(), ctxUserIDKey, user.UserID)
			ctx = context.WithValue(ctx, ctxRoleKey, user.Role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext возвращает userID и роль, если они есть в контексте
func GetUserFromContext(r *http.Request) (userID int64, role string, ok bool) {
	uid, ok1 := r.Context().Value(ctxUserIDKey).(int64)
	rl, ok2 := r.Context().Value(ctxRoleKey).(string)
	if !ok1 || !ok2 {
		return 0, "", false
	}
	return uid, rl, true
}
