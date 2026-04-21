import { useEffect, useMemo, useState } from "react";
import { getMyBookings, cancelMyBooking } from "../api/bookings";
import type { Booking } from "../types";

export function useMyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState<"new" | "old">("new");
    const [serviceFilter, setServiceFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");

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
        if (!confirm("Отменить бронирование?")) return;
        try {
            await cancelMyBooking(id);
            await load();
        } catch {
            alert("Не удалось отменить бронирование");
        }
    }

    const services = useMemo(() => {
        const set = new Set<string>();
        bookings.forEach(b =>
            (b.BookingServices ?? []).forEach(bs => {
                const t = bs.CompanyService?.Service?.Title;
                if (t) set.add(t);
            })
        );
        return [...set].sort((a, b) => a.localeCompare(b, "ru"));
    }, [bookings]);

    const companies = useMemo(() => {
        const set = new Set<string>();
        bookings.forEach(b =>
            (b.BookingServices ?? []).forEach(bs => {
                const n = bs.CompanyService?.Company?.Name;
                if (n) set.add(n);
            })
        );
        return [...set].sort((a, b) => a.localeCompare(b, "ru"));
    }, [bookings]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        let list = bookings;

        if (statusFilter !== "all") {
            list = list.filter((b) => b.Status === statusFilter);
        }

        if (serviceFilter) {
            list = list.filter(b =>
                (b.BookingServices ?? []).some(bs => bs.CompanyService?.Service?.Title === serviceFilter)
            );
        }

        if (companyFilter) {
            list = list.filter(b =>
                (b.BookingServices ?? []).some(bs => bs.CompanyService?.Company?.Name === companyFilter)
            );
        }

        if (query) {
            list = list.filter((b) =>
                `${b.BookingID} ${b.Status} ${b.Description ?? ""}`.toLowerCase().includes(query)
            );
        }

        return [...list].sort((a, b) =>
            sort === "old" ? a.BookingID - b.BookingID : b.BookingID - a.BookingID
        );
    }, [bookings, q, statusFilter, sort, serviceFilter, companyFilter]);

    return {
        bookings, filtered, loading, error,
        q, setQ,
        statusFilter, setStatusFilter,
        sort, setSort,
        serviceFilter, setServiceFilter,
        companyFilter, setCompanyFilter,
        services, companies,
        handleDelete,
    };
}
