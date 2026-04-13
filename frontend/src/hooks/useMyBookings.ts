import { useEffect, useMemo, useState } from "react";
import { getMyBookings, deleteMyBooking } from "../api/bookings";
import type { Booking } from "../types";

export function useMyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"new" | "old">("new");

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setBookings(await getMyBookings());
        } catch {
            setError("Не удалось загрузить бронирования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(id: number) {
        if (!confirm(`Удалить бронирование #${id}?`)) return;
        try {
            await deleteMyBooking(id);
            await load();
        } catch {
            alert("Не удалось удалить бронирование");
        }
    }

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        let list = bookings;
        if (query) {
            list = list.filter((b) =>
                `${b.BookingID} ${b.Status} ${b.Description ?? ""}`.toLowerCase().includes(query)
            );
        }
        return [...list].sort((a, b) =>
            sort === "new" ? b.BookingID - a.BookingID : a.BookingID - b.BookingID
        );
    }, [bookings, q, sort]);

    return { bookings, filtered, loading, error, q, setQ, sort, setSort, handleDelete };
}
