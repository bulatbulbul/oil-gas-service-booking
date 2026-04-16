import { useEffect, useMemo, useState } from "react";
import { getCompanyBookings, updateCompanyBookingStatus } from "../api/bookings";
import type { Booking } from "../types";

export function useCompanyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState<"new" | "old">("new");

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setBookings(await getCompanyBookings());
        } catch {
            setError("Не удалось загрузить бронирования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleStatusChange(bookingId: number, status: string) {
        try {
            await updateCompanyBookingStatus(bookingId, status);
            await load();
        } catch {
            alert("Не удалось обновить статус");
        }
    }

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        let list = bookings;

        if (statusFilter !== "all") {
            list = list.filter((b) => b.Status === statusFilter);
        }

        if (query) {
            list = list.filter((b) => {
                const clientName = b.User?.Name ?? "";
                const services = (b.BookingServices ?? [])
                    .map((bs) => bs.CompanyService?.Service?.Title ?? "")
                    .join(" ");
                return `${b.BookingID} ${b.Status} ${b.Description ?? ""} ${clientName} ${services}`
                    .toLowerCase()
                    .includes(query);
            });
        }

        return [...list].sort((a, b) =>
            sort === "new" ? b.BookingID - a.BookingID : a.BookingID - b.BookingID
        );
    }, [bookings, q, statusFilter, sort]);

    return { bookings, filtered, loading, error, q, setQ, statusFilter, setStatusFilter, sort, setSort, handleStatusChange };
}
