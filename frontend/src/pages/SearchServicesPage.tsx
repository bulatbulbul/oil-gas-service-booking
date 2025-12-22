import { useEffect, useState } from "react";
import api from "../api";

type Service = {
    ServiceID: number;
    Title: string;
};

type CompanyServiceResult = {
    CompanyID: number;
    Name: string;
    CompanyServiceID: number;
};

type CreatedBooking = {
    BookingID: number;
    Status: string;
};

function SearchServicesPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<CompanyServiceResult[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Загружаем все услуги при первой загрузке
    useEffect(() => {
        async function loadServices() {
            try {
                setServicesLoading(true);
                const res = await api.get("/services");
                setAllServices(Array.isArray(res.data) ? res.data : []);
            } catch (err: any) {
                console.log("SERVICES LOAD ERROR", err.response?.status, err.response?.data);
            } finally {
                setServicesLoading(false);
            }
        }
        loadServices();
    }, []);

    // Фильтруем услуги при изменении query
    useEffect(() => {
        if (query.trim()) {
            const filtered = allServices.filter((s) =>
                s.Title.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredServices(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredServices([]);
            setShowSuggestions(false);
        }
    }, [query]);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!query.trim()) return;

        try {
            setLoading(true);
            const res = await api.get(
                `/business/companies-by-service/${encodeURIComponent(query)}`
            );
            console.log("SEARCH RESULTS", res.data);
            setResults(Array.isArray(res.data) ? res.data : []);

            if (res.data.length === 0) {
                setMessage("Услуга не найдена у доступных компаний");
            }
            setShowSuggestions(false); // Скрываем подсказки после поиска
        } catch (err: any) {
            console.log("SEARCH ERROR", err.response?.status, err.response?.data);
            setError("Ошибка поиска услуги");
        } finally {
            setLoading(false);
        }
    }

    function handleSelectService(serviceTitle: string) {
        setQuery(serviceTitle);
        setShowSuggestions(false);
    }

    async function handleBook(company: CompanyServiceResult) {
        try {
            setError(null);
            setMessage(null);

            // 1. создаём бронирование
            const bookingRes = await api.post("/bookings", {
                description: `Бронирование услуги "${query}" в компании "${company.Name}"`,
                status: "requested",
            });

            const booking = bookingRes.data;

            // 2. привязываем услугу к бронированию
            await api.post("/booking-services", {
                booking_id: booking.BookingID,
                company_service_id: company.CompanyServiceID,
                notes: null,
            });

            setMessage(
                `Создано бронирование #${booking.BookingID} с услугой компании "${company.Name}".`
            );
            setResults([]);
            setQuery("");
        } catch (err: any) {
            console.log("BOOK ERROR", err.response?.status, err.response?.data);
            setError("Не удалось создать бронирование с услугой");
        }
    }

    return (
        <div
            style={{
                minHeight: "calc(100vh - 160px)",
                display: "flex",
                justifyContent: "center",
                padding: "32px 16px",
            }}
        >
            <div
                style={{
                    maxWidth: 900,
                    width: "100%",
                }}
            >
                <div
                    style={{
                        background: "white",
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                        marginBottom: 24,
                    }}
                >
                    <h2
                        style={{
                            fontSize: 22,
                            fontWeight: 600,
                            marginBottom: 8,
                            color: "#111827",
                        }}
                    >
                        Поиск услуги
                    </h2>
                    <p
                        style={{
                            fontSize: 14,
                            color: "#6b7280",
                            marginBottom: 20,
                        }}
                    >
                        Найдите нужную услугу и узнайте, какие компании её предоставляют.
                    </p>

                    <form onSubmit={handleSearch} style={{ position: "relative" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: 20,
                                position: "relative",
                            }}
                        >
                            <div style={{ flex: 1, position: "relative" }}>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Введите название услуги (нажмите чтобы увидеть список)..."
                                    onFocus={() => {
                                        if (query.trim()) {
                                            setShowSuggestions(filteredServices.length > 0);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Задержка, чтобы успеть кликнуть на вариант
                                        setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: 10,
                                        fontSize: 14,
                                        boxSizing: "border-box",
                                    }}
                                />

                                {/* Всплывающий список услуг */}
                                {showSuggestions && filteredServices.length > 0 && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            background: "white",
                                            border: "1px solid #d1d5db",
                                            borderTop: "none",
                                            borderRadius: "0 0 10px 10px",
                                            maxHeight: 250,
                                            overflowY: "auto",
                                            zIndex: 10,
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        }}
                                    >
                                        {filteredServices.map((service) => (
                                            <div
                                                key={service.ServiceID}
                                                onClick={() => handleSelectService(service.Title)}
                                                style={{
                                                    padding: "10px 12px",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid #e5e7eb",
                                                    fontSize: 14,
                                                    color: "#111827",
                                                    transition: "background-color 150ms",
                                                }}
                                                onMouseEnter={(e) => {
                                                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                                                        "#f3f4f6";
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                                                        "white";
                                                }}
                                            >
                                                {service.Title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || servicesLoading}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: loading ? "#93c5fd" : "#2563eb",
                                    color: "white",
                                    fontWeight: 500,
                                    fontSize: 14,
                                    cursor: loading ? "default" : "pointer",
                                }}
                            >
                                {loading ? "Поиск..." : "Найти"}
                            </button>
                        </div>
                    </form>

                    {/* Статусы */}
                    {servicesLoading && (
                        <div style={{ fontSize: 14, color: "#6b7280" }}>
                            Загрузка списка услуг...
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                fontSize: 14,
                                color: "#dc2626",
                                padding: "10px 12px",
                                background: "#fee2e2",
                                borderRadius: 8,
                                marginBottom: 12,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {message && (
                        <div
                            style={{
                                fontSize: 14,
                                color: "#059669",
                                padding: "10px 12px",
                                background: "#d1fae5",
                                borderRadius: 8,
                                marginBottom: 12,
                            }}
                        >
                            {message}
                        </div>
                    )}
                </div>

                {/* Результаты поиска */}
                {results.length > 0 && (
                    <div
                        style={{
                            background: "white",
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                marginBottom: 16,
                                color: "#111827",
                            }}
                        >
                            Компании, предоставляющие услугу «{query}»
                        </h3>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            {results.map((company) => (
                                <div
                                    key={company.CompanyServiceID}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: 12,
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 10,
                                        background: "#f9fafb",
                                    }}
                                >
                                    <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>
                                        {company.Name}
                                    </div>
                                    <button
                                        onClick={() => handleBook(company)}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: 8,
                                            border: "none",
                                            background: "#2563eb",
                                            color: "white",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Забронировать
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchServicesPage;
