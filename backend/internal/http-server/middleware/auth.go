package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey string

const (
	ctxUserIDKey ctxKey = "user_id"
	ctxRoleKey   ctxKey = "role"
)

type Claims struct {
	UserID int64  `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret []byte

func SetJWTSecret(secret string) {
	jwtSecret = []byte(secret)
}

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

func BasicAuthMiddleware(adminOnly bool) func(http.Handler) http.Handler {
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

			if adminOnly && claims.Role != "admin" {
				http.Error(w, "Admin access required", http.StatusForbidden)
				return
			}

			ctx := context.WithValue(r.Context(), ctxUserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, ctxRoleKey, claims.Role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserFromContext(r *http.Request) (userID int64, role string, ok bool) {
	uid, ok1 := r.Context().Value(ctxUserIDKey).(int64)
	rl, ok2 := r.Context().Value(ctxRoleKey).(string)
	if !ok1 || !ok2 {
		return 0, "", false
	}
	return uid, rl, true
}
