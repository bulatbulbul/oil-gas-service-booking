import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

type Booking = {
    BookingID: number;
    Status: string;
    Description?: string | null;
    UserID?: number | null;
};

type BookingService = {
    BookingServiceID: number;
    BookingID: number;
    CompanyServiceID: number;
    Notes?: string | null;
    CompanyService?: {
        Company?: { CompanyID: number; Name: string };
        Service?: { ServiceID: number; Title: string };
    };
};

function BookingDetailsPage() {
    const { id } = useParams(); // из /bookings/:id
    const bookingId = Number(id);

    const [booking, setBooking] = useState<Booking | null>(null);
    const [services, setServices] = useState<BookingService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [companyServiceId, setCompanyServiceId] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [adding, setAdding] = useState(false);

    async function load() {
        try {
            setLoading(true);

            const [bookingRes, servicesRes] = await Promise.all([
                api.get<Booking>(`/bookings/${bookingId}`),
                api.get<BookingService[]>(`/bookings/${bookingId}/services`),
            ]);

            setBooking(bookingRes.data);
            setServices(servicesRes.data);
        } catch (err: any) {
            console.log("BOOKING DETAILS ERROR", err.response?.status, err.response?.data);
            setError("Не удалось загрузить данные бронирования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!Number.isNaN(bookingId)) {
            load();
        }
    }, [bookingId]);

    async function handleAddService(e: React.FormEvent) {
        e.preventDefault();
        if (!companyServiceId.trim()) return;

        try {
            setAdding(true);
            await api.post("/booking-services", {
                booking_id: bookingId,
                company_service_id: Number(companyServiceId),
                notes: notes || undefined,
            });
            setCompanyServiceId("");
            setNotes("");
            await load();
        } catch (err: any) {
            console.log("ADD BOOKING SERVICE ERROR", err.response?.status, err.response?.data);
            alert("Ошибка добавления услуги в бронирование");
        } finally {
            setAdding(false);
        }
    }

    if (loading) return <p style={{ margin: 20 }}>Загрузка...</p>;
    if (error) return <p style={{ margin: 20, color: "red" }}>{error}</p>;
    if (!booking) return <p style={{ margin: 20 }}>Бронирование не найдено</p>;

    return (
        <div style={{ maxWidth: 800, margin: "40px auto" }}>
            <h1>Бронирование #{booking.BookingID}</h1>
            <p>Статус: {booking.Status}</p>
            <p>Описание: {booking.Description || "—"}</p>
            <p>UserID: {booking.UserID ?? "—"}</p>

            <h2 style={{ marginTop: 30 }}>Услуги в бронировании</h2>
            {services.length === 0 ? (
                <p>Пока нет услуг</p>
            ) : (
                <ul>
                    {services.map((s) => (
                        <li key={s.BookingServiceID}>
                            {s.CompanyService?.Company?.Name ?? "Компания ?"} —{" "}
                            {s.CompanyService?.Service?.Title ?? "Услуга ?"}{" "}
                            {s.Notes ? `(примечание: ${s.Notes})` : ""}
                        </li>
                    ))}
                </ul>
            )}

            <h3 style={{ marginTop: 20 }}>Добавить услугу</h3>
            <form onSubmit={handleAddService}>
                <div style={{ marginBottom: 8 }}>
                    <label>ID связи company_service</label>
                    <br />
                    <input
                        type="number"
                        value={companyServiceId}
                        onChange={(e) => setCompanyServiceId(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>Примечание (опционально)</label>
                    <br />
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={adding}>
                    Добавить
                </button>
            </form>
        </div>
    );
}

export default BookingDetailsPage;
