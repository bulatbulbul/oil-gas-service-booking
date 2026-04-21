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
    const [serviceFilter, setServiceFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [clientFilter, setClientFilter] = useState("");

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

    const clients = useMemo(() => {
        const set = new Set<string>();
        bookings.forEach(b => { if (b.User?.Name) set.add(b.User.Name); });
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

        if (clientFilter) {
            list = list.filter(b => b.User?.Name === clientFilter);
        }

        if (query) {
            list = list.filter((b) => {
                const clientName = b.User?.Name ?? "";
                const svcs = (b.BookingServices ?? [])
                    .map((bs) => bs.CompanyService?.Service?.Title ?? "")
                    .join(" ");
                return `${b.BookingID} ${b.Status} ${b.Description ?? ""} ${clientName} ${svcs}`
                    .toLowerCase()
                    .includes(query);
            });
        }

        return [...list].sort((a, b) =>
            sort === "old" ? a.BookingID - b.BookingID : b.BookingID - a.BookingID
        );
    }, [bookings, q, statusFilter, sort, serviceFilter, companyFilter, clientFilter]);

    return {
        bookings, filtered, loading, error,
        q, setQ,
        statusFilter, setStatusFilter,
        sort, setSort,
        serviceFilter, setServiceFilter,
        companyFilter, setCompanyFilter,
        clientFilter, setClientFilter,
        services, companies, clients,
        handleStatusChange,
    };
}
