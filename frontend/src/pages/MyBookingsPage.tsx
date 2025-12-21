import { useEffect, useState } from "react";
import { api } from "../api";

type Booking = {
    BookingID: number;
    Status: string;
    Description?: string | null;
    UserID?: number | null;
};

function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await api.get<Booking[]>("/bookings/me");

                const all = res.data;

                // Берём id текущего пользователя из токена нельзя (там только email/pass),
                // поэтому считаем, что сервер уже отдаёт только "разрешённые" бронирования.
                // Если хочешь строгую фильтрацию, нужно будет сделать отдельный эндпоинт на бэке.

                setBookings(all);
            } catch (err: any) {
                console.log("MY BOOKINGS ERROR", err.response?.status, err.response?.data);
                setError("Не удалось загрузить мои бронирования");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p style={{ margin: 20 }}>Загрузка...</p>;
    if (error) return <p style={{ margin: 20, color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 700, margin: "40px auto" }}>
            <h1>Мои бронирования</h1>
            {bookings.length === 0 ? (
                <p>У вас пока нет бронирований</p>
            ) : (
                <ul>
                    {bookings.map((b) => (
                        <li key={b.BookingID}>
                            #{b.BookingID} — статус: {b.Status} — {b.Description || "без описания"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyBookingsPage;
