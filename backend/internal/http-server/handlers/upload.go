package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	authmw "oil-gas-service-booking/internal/http-server/middleware"
	"oil-gas-service-booking/internal/models"
)

type UploadHandler struct {
	db         *gorm.DB
	uploadsDir string
}

func NewUploadHandler(db *gorm.DB, uploadsDir string) *UploadHandler {
	return &UploadHandler{db: db, uploadsDir: uploadsDir}
}

// UploadAvatar godoc
// @Summary Загрузить аватар пользователя
// @Tags upload
// @Security BasicAuth
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Изображение (jpg, png, gif, webp)"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 500 {string} string
// @Router /upload/avatar [post]
func (h *UploadHandler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	url, err := h.saveUpload(r, "file", filepath.Join(h.uploadsDir, "avatars"), fmt.Sprintf("%d", userID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Model(&models.User{}).Where("user_id = ?", userID).Update("avatar_url", url).Error; err != nil {
		http.Error(w, "failed to update user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"avatar_url":%q}`, url)
}

// UploadCompanyLogo godoc
// @Summary Загрузить логотип компании
// @Tags upload
// @Security BasicAuth
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Company ID"
// @Param file formData file true "Изображение (jpg, png, gif, webp)"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 403 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /upload/companies/{id}/logo [post]
func (h *UploadHandler) UploadCompanyLogo(w http.ResponseWriter, r *http.Request) {
	userID, _, ok := authmw.GetUserFromContext(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var company models.Company
	if err := h.db.First(&company, id).Error; err != nil {
		http.Error(w, "company not found", http.StatusNotFound)
		return
	}
	if company.UserID != userID {
		http.Error(w, "forbidden: not your company", http.StatusForbidden)
		return
	}

	url, err := h.saveUpload(r, "file", filepath.Join(h.uploadsDir, "companies"), fmt.Sprintf("%d", id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Model(&models.Company{}).Where("company_id = ?", id).Update("logo_url", url).Error; err != nil {
		http.Error(w, "failed to update company", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"logo_url":%q}`, url)
}

// UploadServiceImage godoc
// @Summary Загрузить фото услуги
// @Tags upload
// @Security BasicAuth
// @Accept multipart/form-data
// @Produce json
// @Param id path int true "Service ID"
// @Param file formData file true "Изображение (jpg, png, gif, webp)"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string
// @Failure 401 {string} string
// @Failure 404 {string} string
// @Failure 500 {string} string
// @Router /services/{id}/image [post]
func (h *UploadHandler) UploadServiceImage(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var svc models.Service
	if err := h.db.First(&svc, id).Error; err != nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	url, err := h.saveUpload(r, "file", filepath.Join(h.uploadsDir, "services"), fmt.Sprintf("%d", id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Model(&models.Service{}).Where("service_id = ?", id).Update("image_url", url).Error; err != nil {
		http.Error(w, "failed to update service", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"image_url":%q}`, url)
}

// saveUpload парсит multipart-форму, проверяет расширение, сохраняет файл и возвращает URL.
func (h *UploadHandler) saveUpload(r *http.Request, field, dir, nameWithoutExt string) (string, error) {
	const maxSize = 8 << 20 // 8 MB
	if err := r.ParseMultipartForm(maxSize); err != nil {
		return "", fmt.Errorf("failed to parse form: %w", err)
	}

	file, header, err := r.FormFile(field)
	if err != nil {
		return "", fmt.Errorf("file field %q is required", field)
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowed[ext] {
		return "", fmt.Errorf("unsupported file type %q; allowed: jpg, png, gif, webp", ext)
	}

	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("cannot create upload dir: %w", err)
	}

	filename := nameWithoutExt + ext
	dest := filepath.Join(dir, filename)

	out, err := os.Create(dest)
	if err != nil {
		return "", fmt.Errorf("cannot create file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		return "", fmt.Errorf("cannot write file: %w", err)
	}

	// URL относительно /uploads/
	rel, _ := filepath.Rel(h.uploadsDir, dest)
	return "/uploads/" + filepath.ToSlash(rel), nil
}
