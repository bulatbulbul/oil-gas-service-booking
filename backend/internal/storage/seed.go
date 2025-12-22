package storage

import (
	"fmt"
	"math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"oil-gas-service-booking/internal/models"
)

func Seed(db *gorm.DB) error {
	var count int64
	db.Model(&models.Company{}).Count(&count)
	if count > 0 {
		fmt.Println("База уже содержит данные, пропускаем seed")
		return nil
	}

	fmt.Println("Заполнение базы тестовыми данными...")

	users := []models.User{
		{
			Name:     "Администратор Системы",
			Email:    stringPtr("admin@oilgas.ru"),
			Password: hashPassword("admin"),
			Role:     "admin",
		},
		{
			Name:     "Булат Сайфуллин",
			Email:    stringPtr("bulat@oilgas.ru"),
			Password: hashPassword("bulat"),
			Role:     "customer",
		},
		{
			Name:     "Анна Литвина",
			Email:    stringPtr("a.litvina@oilgas.ru"),
			Password: hashPassword("litvina789!"),
			Role:     "customer",
		},
		{
			Name:     "Сергей Петров",
			Email:    stringPtr("s.petrov@oilgas.ru"),
			Password: hashPassword("Petrov456!"),
			Role:     "customer",
		},
		{
			Name:     "Ирина Морозова",
			Email:    stringPtr("i.morozova@oilgas.ru"),
			Password: hashPassword("Morozova789!"),
			Role:     "customer",
		},
		{
			Name:     "Андрей Кузнецов",
			Email:    stringPtr("a.kuznetsov@oilgas.ru"),
			Password: hashPassword("Kuznetsov123!"),
			Role:     "customer",
		},
		{
			Name:     "Мария Сорокина",
			Email:    stringPtr("m.sorokina@oilgas.ru"),
			Password: hashPassword("Sorokina456!"),
			Role:     "customer",
		},
	}

	for i := range users {
		if err := db.Create(&users[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания пользователя: %w", err)
		}
	}
	fmt.Printf("✅ Создано %d пользователей\n", len(users))

	userIDByEmail := map[string]int64{}
	for _, u := range users {
		if u.Email != nil {
			userIDByEmail[*u.Email] = u.UserID
		}
	}

	serviceTitles := []string{
		"Бурение вертикальных скважин",
		"Бурение наклонных скважин",
		"Бурение горизонтальных скважин",
		"Глубокое бурение",
		"Геологоразведка",
		"Геофизические исследования",
		"Сейсмические работы 2D",
		"Сейсмические работы 3D",
		"Интерпретация сейсмоданных",
		"Каротажные работы",
		"Капитальный ремонт скважин",
		"Текущий ремонт скважин",
		"Техническое обслуживание оборудования",
		"Диагностика оборудования",
		"Ремонт трубопроводов",
		"Неразрушающий контроль (НК)",
		"Гидравлические испытания",
		"Транспортировка нефти",
		"Транспортировка газа",
		"Логистика и доставка оборудования",
		"Пусконаладочные работы",
		"Электромонтаж и КИПиА",
		"Автоматизация (АСУ ТП)",
		"Системы телеметрии и мониторинга",
		"Экологический мониторинг",
		"Рекультивация земель",
		"Оценка промышленной безопасности",
		"Обучение персонала ПБ/ОТ",
		"Проектирование объектов",
		"Сметный аудит",
	}

	services := make([]models.Service, 0, len(serviceTitles))
	for _, t := range serviceTitles {
		services = append(services, models.Service{Title: t})
	}

	for i := range services {
		if err := db.Create(&services[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания услуги: %w", err)
		}
	}
	fmt.Printf("✅ Создано %d услуг\n", len(services))

	type companySeed struct {
		OwnerEmail string
		Name       string
		Address    string
		Desc       string
	}

	companySeeds := []companySeed{
		// Булат
		{"bulat@oilgas.ru", "Bulat Oilfield Service", "г. Москва, ул. Промышленная, 12", "Сервисные работы и ремонт"},
		{"bulat@oilgas.ru", "Bulat Geo Lab", "г. Москва, Ленинградский пр-т, 33", "Геофизика, интерпретация, каротаж"},
		{"bulat@oilgas.ru", "Bulat Logistics", "г. Москва, ул. Складская, 8", "Логистика и доставка оборудования"},

		// Анна
		{"a.litvina@oilgas.ru", "Литвина Инжиниринг", "г. Санкт-Петербург, Невский пр., 101", "Проектирование и инжиниринг"},
		{"a.litvina@oilgas.ru", "Литвина Экология", "г. Санкт-Петербург, ул. Эко, 7", "Экологический мониторинг и рекультивация"},
		{"a.litvina@oilgas.ru", "Литвина Контроль", "г. Санкт-Петербург, Лиговский пр., 12", "НК, диагностика и испытания"},

		// Сергей
		{"s.petrov@oilgas.ru", "Петров Бурение", "г. Тюмень, ул. Буровиков, 15", "Бурение и капремонт"},
		{"s.petrov@oilgas.ru", "Петров Ремонт", "г. Тюмень, ул. Сервисная, 22", "ТО, ремонт, НКТ"},
		{"s.petrov@oilgas.ru", "Петров Трубопровод", "г. Тюмень, ул. Магистральная, 3", "Ремонт трубопроводов и НК"},

		// Ирина
		{"i.morozova@oilgas.ru", "Морозова Арктик Сервис", "г. Мурманск, ул. Арктическая, 1", "Работы в северных регионах"},
		{"i.morozova@oilgas.ru", "Морозова Монтаж", "г. Мурманск, пр. Ленина, 55", "Электромонтаж и КИПиА"},
		{"i.morozova@oilgas.ru", "Морозова Автоматика", "г. Архангельск, ул. Технопарк, 9", "АСУ ТП и телеметрия"},

		// Андрей
		{"a.kuznetsov@oilgas.ru", "Кузнецов Электро", "г. Новосибирск, ул. Электрическая, 40", "Электрика, КИПиА, ПНР"},
		{"a.kuznetsov@oilgas.ru", "Кузнецов Автоматика", "г. Новосибирск, ул. Техническая, 18", "АСУ ТП и мониторинг"},
		{"a.kuznetsov@oilgas.ru", "Кузнецов ПБ", "г. Новосибирск, ул. Безопасности, 6", "Промбезопасность и обучение"},

		// Мария
		{"m.sorokina@oilgas.ru", "Сорокина Экология", "г. Тюмень, ул. Экологическая, 35", "Экология и рекультивация"},
		{"m.sorokina@oilgas.ru", "Сорокина Гео", "г. Тюмень, ул. Геологов, 10", "Геологоразведка и сейсмика"},
		{"m.sorokina@oilgas.ru", "Сорокина Логистик", "г. Тюмень, ул. Складская, 2", "Логистика и доставка"},
	}

	companies := make([]models.Company, 0, len(companySeeds))
	for _, cs := range companySeeds {
		uid, ok := userIDByEmail[cs.OwnerEmail]
		if !ok {
			return fmt.Errorf("не найден пользователь по email %s", cs.OwnerEmail)
		}

		companies = append(companies, models.Company{
			UserID:      uid,
			Name:        cs.Name,
			Address:     stringPtr(cs.Address),
			Description: stringPtr(cs.Desc),
		})
	}

	for i := range companies {
		if err := db.Create(&companies[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания компании: %w", err)
		}
	}
	fmt.Printf("✅ Создано %d компаний\n", len(companies))

	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))

	attachN := func(companyID int64, n int) error {
		if n <= 0 {
			return nil
		}
		if n > len(services) {
			n = len(services)
		}

		used := map[int]struct{}{}
		for len(used) < n {
			used[rnd.Intn(len(services))] = struct{}{}
		}

		for idx := range used {
			cs := models.CompanyService{
				CompanyID: companyID,
				ServiceID: services[idx].ServiceID,
			}
			if err := db.Create(&cs).Error; err != nil {
				return fmt.Errorf("ошибка создания связи company_service: %w", err)
			}
		}
		return nil
	}

	totalLinks := 0
	for _, c := range companies {
		n := 3 + rnd.Intn(4)
		if err := attachN(c.CompanyID, n); err != nil {
			return err
		}
		totalLinks += n
	}
	fmt.Printf("✅ Создано ~%d связей компаний и услуг\n", totalLinks)

	bookings := []models.Booking{
		{
			UserID:      intPtr(userIDByEmail["bulat@oilgas.ru"]),
			Description: stringPtr("Запрос: диагностика оборудования и НК"),
			Status:      "requested",
		},
		{
			UserID:      intPtr(userIDByEmail["a.litvina@oilgas.ru"]),
			Description: stringPtr("Запрос: экологический мониторинг участка"),
			Status:      "active",
		},
		{
			UserID:      intPtr(userIDByEmail["s.petrov@oilgas.ru"]),
			Description: stringPtr("Запрос: бурение скважины под куст"),
			Status:      "completed",
		},
	}

	for i := range bookings {
		if err := db.Create(&bookings[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания бронирования: %w", err)
		}
	}
	fmt.Printf("Создано %d бронирований\n", len(bookings))

	return nil
}

func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(fmt.Sprintf("Ошибка хеширования пароля: %v", err))
	}
	return string(hash)
}

func stringPtr(s string) *string { return &s }
func intPtr(i int64) *int64      { return &i }
