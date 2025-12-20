package storage

import (
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"oil-gas-service-booking/internal/models"
)

// Seed заполняет базу данных тестовыми данными
func Seed(db *gorm.DB) error {
	// Проверяем, есть ли уже данные
	var count int64
	db.Model(&models.Company{}).Count(&count)
	if count > 0 {
		fmt.Println("База уже содержит данные, пропускаем seed")
		return nil
	}

	fmt.Println("Заполнение базы тестовыми данными...")

	// Создаем компании нефтегазовой отрасли
	companies := []models.Company{
		{Name: "Газпром нефть"},
		{Name: "Лукойл"},
		{Name: "Роснефть"},
		{Name: "Татнефть"},
		{Name: "Сургутнефтегаз"},
		{Name: "Башнефть"},
		{Name: "Новатэк"},
		{Name: "Транснефть"},
		{Name: "Газпром"},
		{Name: "Сибур"},
		{Name: "Зарубежнефть"},
		{Name: "Росгеология"},
		{Name: "Славнефть"},
		{Name: "Альянс Нефть"},
		{Name: "Нефтегазстрой"},
		{Name: "Тюменнефтегаз"},
		{Name: "Восток Нефть"},
		{Name: "Северсталь-нефть"},
		{Name: "Ямал СПГ"},
		{Name: "Арктикгаз"},
	}

	for i := range companies {
		if err := db.Create(&companies[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания компании: %w", err)
		}
	}

	fmt.Printf("Создано %d компаний\n", len(companies))

	// Создаем услуги для нефтегазовой отрасли
	services := []models.Service{
		{Title: "Бурение скважин"},
		{Title: "Геологоразведка"},
		{Title: "Капитальный ремонт скважин"},
		{Title: "Геофизические исследования"},
		{Title: "Транспортировка нефти"},
		{Title: "Переработка нефти"},
		{Title: "Диагностика оборудования"},
		{Title: "Техническое обслуживание"},
		{Title: "Ремонт трубопроводов"},
		{Title: "Экологический мониторинг"},
		{Title: "Лабораторные исследования"},
		{Title: "Инженерные изыскания"},
		{Title: "Проектирование объектов"},
		{Title: "Строительство нефтебаз"},
		{Title: "Монтаж оборудования"},
		{Title: "Пусконаладочные работы"},
		{Title: "Контроль качества"},
		{Title: "Аудит безопасности"},
		{Title: "Обучение персонала"},
		{Title: "Консультационные услуги"},
		{Title: "Логистика и снабжение"},
		{Title: "IT-решения для нефтегаза"},
		{Title: "Цифровизация процессов"},
		{Title: "Аварийно-спасательные работы"},
		{Title: "Очистка резервуаров"},
		{Title: "Антикоррозийная защита"},
		{Title: "Утилизация отходов"},
		{Title: "Энергоаудит"},
		{Title: "Сертификация"},
		{Title: "Лизинговые услуги"},
	}

	for i := range services {
		if err := db.Create(&services[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания услуги: %w", err)
		}
	}

	fmt.Printf("Создано %d услуг\n", len(services))

	// Создаем связи компаний и услуг
	companyServices := []models.CompanyService{
		// Газпром нефть предоставляет широкий спектр услуг
		{CompanyID: 1, ServiceID: 1},  // Бурение скважин
		{CompanyID: 1, ServiceID: 2},  // Геологоразведка
		{CompanyID: 1, ServiceID: 4},  // Геофизические исследования
		{CompanyID: 1, ServiceID: 7},  // Диагностика оборудования
		{CompanyID: 1, ServiceID: 19}, // Обучение персонала
		{CompanyID: 1, ServiceID: 22}, // IT-решения для нефтегаза

		// Лукойл
		{CompanyID: 2, ServiceID: 1},  // Бурение скважин
		{CompanyID: 2, ServiceID: 5},  // Транспортировка нефти
		{CompanyID: 2, ServiceID: 6},  // Переработка нефти
		{CompanyID: 2, ServiceID: 8},  // Техническое обслуживание
		{CompanyID: 2, ServiceID: 27}, // Утилизация отходов

		// Роснефть
		{CompanyID: 3, ServiceID: 1},  // Бурение скважин
		{CompanyID: 3, ServiceID: 3},  // Капитальный ремонт скважин
		{CompanyID: 3, ServiceID: 9},  // Ремонт трубопроводов
		{CompanyID: 3, ServiceID: 14}, // Строительство нефтебаз
		{CompanyID: 3, ServiceID: 18}, // Аудит безопасности

		// Татнефть
		{CompanyID: 4, ServiceID: 2},  // Геологоразведка
		{CompanyID: 4, ServiceID: 7},  // Диагностика оборудования
		{CompanyID: 4, ServiceID: 10}, // Экологический мониторинг
		{CompanyID: 4, ServiceID: 26}, // Антикоррозийная защита
		{CompanyID: 4, ServiceID: 28}, // Энергоаудит

		// Сургутнефтегаз
		{CompanyID: 5, ServiceID: 1},  // Бурение скважин
		{CompanyID: 5, ServiceID: 4},  // Геофизические исследования
		{CompanyID: 5, ServiceID: 15}, // Монтаж оборудования
		{CompanyID: 5, ServiceID: 24}, // Аварийно-спасательные работы
		{CompanyID: 5, ServiceID: 25}, // Очистка резервуаров

		// Башнефть
		{CompanyID: 6, ServiceID: 6},  // Переработка нефти
		{CompanyID: 6, ServiceID: 8},  // Техническое обслуживание
		{CompanyID: 6, ServiceID: 11}, // Лабораторные исследования
		{CompanyID: 6, ServiceID: 17}, // Контроль качества
		{CompanyID: 6, ServiceID: 29}, // Сертификация

		// Новатэк
		{CompanyID: 7, ServiceID: 2},  // Геологоразведка
		{CompanyID: 7, ServiceID: 12}, // Инженерные изыскания
		{CompanyID: 7, ServiceID: 13}, // Проектирование объектов
		{CompanyID: 7, ServiceID: 16}, // Пусконаладочные работы
		{CompanyID: 7, ServiceID: 21}, // Логистика и снабжение

		// Транснефть
		{CompanyID: 8, ServiceID: 5},  // Транспортировка нефти
		{CompanyID: 8, ServiceID: 9},  // Ремонт трубопроводов
		{CompanyID: 8, ServiceID: 15}, // Монтаж оборудования
		{CompanyID: 8, ServiceID: 20}, // Консультационные услуги
		{CompanyID: 8, ServiceID: 30}, // Лизинговые услуги

		// Газпром
		{CompanyID: 9, ServiceID: 1},  // Бурение скважин
		{CompanyID: 9, ServiceID: 4},  // Геофизические исследования
		{CompanyID: 9, ServiceID: 10}, // Экологический мониторинг
		{CompanyID: 9, ServiceID: 19}, // Обучение персонала
		{CompanyID: 9, ServiceID: 23}, // Цифровизация процессов

		// Сибур
		{CompanyID: 10, ServiceID: 6},  // Переработка нефти
		{CompanyID: 10, ServiceID: 11}, // Лабораторные исследования
		{CompanyID: 10, ServiceID: 17}, // Контроль качества
		{CompanyID: 10, ServiceID: 27}, // Утилизация отходов
		{CompanyID: 10, ServiceID: 29}, // Сертификация
	}

	for i := range companyServices {
		if err := db.Create(&companyServices[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания связи компании и услуги: %w", err)
		}
	}

	fmt.Printf("Создано %d связей компаний и услуг\n", len(companyServices))

	// Создаем пользователей с хешированными паролями
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
			Role:     "admin",
		},

		{
			Name:     "Анна Смирнова",
			Email:    stringPtr("a.smirnova@oilgas.ru"),
			Password: hashPassword("Smirnova789!"),
			Role:     "customer",
		},
		{
			Name:     "Дмитрий Волков",
			Email:    stringPtr("d.volkov@oilgas.ru"),
			Password: hashPassword("Volkov321!"),
			Role:     "customer",
		},

		{
			Name:     "ООО НефтеГазСтрой",
			Email:    stringPtr("contact@ngs.ru"),
			Password: hashPassword("NGS2024!"),
			Role:     "customer",
		},
		{
			Name:     "ПАО Арктикгаз",
			Email:    stringPtr("booking@arcticgas.ru"),
			Password: hashPassword("Arctic2024!"),
			Role:     "customer",
		},
		{
			Name:     "ООО Северные Технологии",
			Email:    stringPtr("tech@north-tech.ru"),
			Password: hashPassword("NorthTech123!"),
			Role:     "customer",
		},
		{
			Name:     "ЗАО ВостокНефть",
			Email:    stringPtr("service@vostokneft.ru"),
			Password: hashPassword("Vostok2024!"),
			Role:     "customer",
		},
		{
			Name:     "ИП Сидоров А.В.",
			Email:    stringPtr("sidorov@contractor.ru"),
			Password: hashPassword("Contractor456!"),
			Role:     "customer",
		},
		{
			Name:     "ООО Промышленные Решения",
			Email:    stringPtr("info@promresheniya.ru"),
			Password: hashPassword("PromResh789!"),
			Role:     "customer",
		},

		{
			Name:     "Сергей Козлов",
			Email:    stringPtr("s.kozlov@engineer.ru"),
			Password: hashPassword("KozlovEng123!"),
			Role:     "customer",
		},
		{
			Name:     "Марина Новикова",
			Email:    stringPtr("m.novikova@engineer.ru"),
			Password: hashPassword("NovikovaEng456!"),
			Role:     "customer",
		},
		{
			Name:     "Алексей Морозов",
			Email:    stringPtr("a.morozov@engineer.ru"),
			Password: hashPassword("MorozovEng789!"),
			Role:     "customer",
		},
		{
			Name:     "Виктор Зайцев",
			Email:    stringPtr("v.zaytsev@tech.ru"),
			Password: hashPassword("ZaytsevTech123!"),
			Role:     "customer",
		},
		{
			Name:     "Елена Воробьева",
			Email:    stringPtr("e.vorobyeva@tech.ru"),
			Password: hashPassword("VorobyevaTech456!"),
			Role:     "customer",
		},
	}

	for i := range users {
		if err := db.Create(&users[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания пользователя: %w", err)
		}
	}

	fmt.Printf("Создано %d пользователей\n", len(users))

	// Создаем бронирования
	bookings := []models.Booking{
		// Активные бронирования
		{
			UserID:      intPtr(5), // ООО НефтеГазСтрой
			Description: stringPtr("Бурение 5 скважин на месторождении Талакан"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, -1, -5),
		},
		{
			UserID:      intPtr(6), // ПАО Арктикгаз
			Description: stringPtr("Геологоразведка в Арктическом регионе"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, -2, -10),
		},
		{
			UserID:      intPtr(7), // ООО Северные Технологии
			Description: stringPtr("Ремонт трубопровода диаметром 1200 мм"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, 0, -15),
		},
		{
			UserID:      intPtr(8), // ЗАО ВостокНефть
			Description: stringPtr("Переработка нефти на заводе в Комсомольске"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, -1, -20),
		},

		// Завершенные бронирования
		{
			UserID:      intPtr(5),
			Description: stringPtr("Диагностика оборудования компрессорной станции"),
			Status:      "completed",
			CreatedAt:   time.Now().AddDate(0, -3, 0),
		},
		{
			UserID:      intPtr(9), // ИП Сидоров А.В.
			Description: stringPtr("Монтаж нового технологического оборудования"),
			Status:      "completed",
			CreatedAt:   time.Now().AddDate(0, -4, -10),
		},
		{
			UserID:      intPtr(10), // ООО Промышленные Решения
			Description: stringPtr("Экологический мониторинг на месторождении"),
			Status:      "completed",
			CreatedAt:   time.Now().AddDate(0, -5, -5),
		},

		// Отмененные бронирования
		{
			UserID:      intPtr(6),
			Description: stringPtr("Строительство нефтебазы (проект отменен)"),
			Status:      "cancelled",
			CreatedAt:   time.Now().AddDate(0, -1, -25),
		},
		{
			UserID:      intPtr(7),
			Description: stringPtr("Закупка оборудования (изменение спецификации)"),
			Status:      "cancelled",
			CreatedAt:   time.Now().AddDate(0, -2, -15),
		},

		// Запрошенные бронирования
		{
			UserID:      intPtr(8),
			Description: stringPtr("Аварийно-спасательные работы на объекте"),
			Status:      "requested",
			CreatedAt:   time.Now().AddDate(0, 0, -3),
		},
		{
			UserID:      intPtr(9),
			Description: stringPtr("Обучение персонала по технике безопасности"),
			Status:      "requested",
			CreatedAt:   time.Now().AddDate(0, 0, -1),
		},
		{
			UserID:      intPtr(10),
			Description: stringPtr("IT-решения для автоматизации процессов"),
			Status:      "requested",
			CreatedAt:   time.Now(),
		},

		// Дополнительные бронирования для статистики
		{
			UserID:      intPtr(5),
			Description: stringPtr("Техническое обслуживание буровых установок"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, 0, -7),
		},
		{
			UserID:      intPtr(6),
			Description: stringPtr("Лабораторные исследования проб нефти"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, 0, -10),
		},
		{
			UserID:      intPtr(11), // Сергей Козлов
			Description: stringPtr("Инженерный надзор за строительством"),
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, -1, -12),
		},
	}

	for i := range bookings {
		if err := db.Create(&bookings[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания бронирования: %w", err)
		}
	}

	fmt.Printf("Создано %d бронирований\n", len(bookings))

	// Создаем связи бронирований с услугами (BookingService)
	bookingServices := []models.BookingService{
		// Бронирование 1: Бурение 5 скважин
		{
			BookingID:        1,
			CompanyServiceID: 1, // Газпром нефть - Бурение скважин
			Notes:            stringPtr("Срок выполнения - 3 месяца, требуются специальные разрешения"),
		},
		{
			BookingID:        1,
			CompanyServiceID: 16, // Лукойл - Бурение скважин
			Notes:            stringPtr("Альтернативный подрядчик"),
		},

		// Бронирование 2: Геологоразведка в Арктике
		{
			BookingID:        2,
			CompanyServiceID: 2, // Газпром нефть - Геологоразведка
			Notes:            stringPtr("Работа в сложных климатических условиях"),
		},
		{
			BookingID:        2,
			CompanyServiceID: 32, // Татнефть - Геологоразведка
			Notes:            stringPtr("Экспертиза геологических данных"),
		},

		// Бронирование 3: Ремонт трубопровода
		{
			BookingID:        3,
			CompanyServiceID: 18, // Роснефть - Ремонт трубопроводов
			Notes:            stringPtr("Аварийный ремонт, требуется срочный выезд бригады"),
		},
		{
			BookingID:        3,
			CompanyServiceID: 43, // Транснефть - Ремонт трубопроводов
			Notes:            stringPtr("Плановый ремонт на следующей неделе"),
		},

		// Бронирование 4: Переработка нефти
		{
			BookingID:        4,
			CompanyServiceID: 17, // Лукойл - Переработка нефти
			Notes:            stringPtr("Модернизация технологической линии"),
		},
		{
			BookingID:        4,
			CompanyServiceID: 31, // Башнефть - Переработка нефти
			Notes:            stringPtr("Консультации по процессам переработки"),
		},

		// Бронирование 5: Диагностика оборудования
		{
			BookingID:        5,
			CompanyServiceID: 4, // Газпром нефть - Диагностика оборудования
			Notes:            stringPtr("Периодическая диагностика согласно регламенту"),
		},
		{
			BookingID:        5,
			CompanyServiceID: 33, // Татнефть - Диагностика оборудования
			Notes:            stringPtr("Углубленная диагностика критических узлов"),
		},

		// Бронирование 6: Монтаж оборудования
		{
			BookingID:        6,
			CompanyServiceID: 20, // Сургутнефтегаз - Монтаж оборудования
			Notes:            stringPtr("Монтаж импортного оборудования, требуется переводчик"),
		},

		// Бронирование 7: Экологический мониторинг
		{
			BookingID:        7,
			CompanyServiceID: 34, // Татнефть - Экологический мониторинг
			Notes:            stringPtr("Ежеквартальный мониторинг согласно лицензии"),
		},
		{
			BookingID:        7,
			CompanyServiceID: 44, // Газпром - Экологический мониторинг
			Notes:            stringPtr("Расширенный мониторинг с отбором проб"),
		},

		// Бронирование 8: Строительство нефтебазы
		{
			BookingID:        8,
			CompanyServiceID: 19, // Роснефть - Строительство нефтебаз
			Notes:            stringPtr("Проект заморожен до получения дополнительного финансирования"),
		},

		// Бронирование 9: Закупка оборудования
		{
			BookingID:        9,
			CompanyServiceID: 48, // Сибур - Контроль качества
			Notes:            stringPtr("Изменение спецификации оборудования, требуется пересмотр контракта"),
		},

		// Бронирование 10: Аварийно-спасательные работы
		{
			BookingID:        10,
			CompanyServiceID: 25, // Сургутнефтегаз - Аварийно-спасательные работы
			Notes:            stringPtr("Требуется срочный выезд аварийной бригады"),
		},

		// Бронирование 11: Обучение персонала
		{
			BookingID:        11,
			CompanyServiceID: 5, // Газпром нефть - Обучение персонала
			Notes:            stringPtr("Группа из 15 человек, курс повышения квалификации"),
		},
		{
			BookingID:        11,
			CompanyServiceID: 49, // Газпром - Обучение персонала
			Notes:            stringPtr("Специализированный курс по работе в Арктике"),
		},

		// Бронирование 12: IT-решения
		{
			BookingID:        12,
			CompanyServiceID: 6, // Газпром нефть - IT-решения для нефтегаза
			Notes:            stringPtr("Разработка системы управления активами"),
		},
		{
			BookingID:        12,
			CompanyServiceID: 54, // Газпром - Цифровизация процессов
			Notes:            stringPtr("Внедрение IoT-решений для мониторинга оборудования"),
		},

		// Бронирование 13: Техническое обслуживание
		{
			BookingID:        13,
			CompanyServiceID: 17, // Лукойл - Техническое обслуживание
			Notes:            stringPtr("Плановое ТО согласно графику"),
		},
		{
			BookingID:        13,
			CompanyServiceID: 32, // Башнефть - Техническое обслуживание
			Notes:            stringPtr("Внеплановое обслуживание по результатам диагностики"),
		},

		// Бронирование 14: Лабораторные исследования
		{
			BookingID:        14,
			CompanyServiceID: 32, // Башнефть - Лабораторные исследования
			Notes:            stringPtr("Анализ 50 проб нефти на соответствие ГОСТ"),
		},
		{
			BookingID:        14,
			CompanyServiceID: 51, // Сибур - Лабораторные исследования
			Notes:            stringPtr("Расширенный химический анализ"),
		},

		// Бронирование 15: Инженерный надзор
		{
			BookingID:        15,
			CompanyServiceID: 37, // Новатэк - Инженерные изыскания
			Notes:            stringPtr("Надзор за строительством объекта в течение 6 месяцев"),
		},
		{
			BookingID:        15,
			CompanyServiceID: 38, // Новатэк - Проектирование объектов
			Notes:            stringPtr("Корректировка проектной документации"),
		},
	}

	for i := range bookingServices {
		if err := db.Create(&bookingServices[i]).Error; err != nil {
			return fmt.Errorf("ошибка создания связи бронирования и услуги: %w", err)
		}
	}

	fmt.Printf("Создано %d связей бронирований и услуг\n", len(bookingServices))

	fmt.Println("База данных успешно заполнена тестовыми данными!")
	return nil
}

// Вспомогательные функции
func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(fmt.Sprintf("Ошибка хеширования пароля: %v", err))
	}
	return string(hash)
}

func stringPtr(s string) *string {
	return &s
}

func intPtr(i int64) *int64 {
	return &i
}
