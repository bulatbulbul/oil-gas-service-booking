import { useEffect, useState } from "react";
import { getAvailableServices } from "../api/services";
import { getCompaniesByService } from "../api/business";
import { createBooking, createBookingService } from "../api/bookings";
import { createServiceRequest } from "../api/serviceRequests";
import type { Service, CompanyServiceResult } from "../types";

export type BookingToast = {
    bookingId: number;
    companyName: string;
};

export function useSearch() {
    const [filter, setFilter] = useState("");
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);

    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [results, setResults] = useState<CompanyServiceResult[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [bookingToast, setBookingToast] = useState<BookingToast | null>(null);
    const [requestSent, setRequestSent] = useState(false);
    const [requestSending, setRequestSending] = useState(false);
    const [pendingCompany, setPendingCompany] = useState<CompanyServiceResult | null>(null);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        getAvailableServices()
            .then(setAllServices)
            .finally(() => setServicesLoading(false));
    }, []);

    const filteredServices = filter.trim()
        ? allServices.filter((s) => s.Title.toLowerCase().includes(filter.toLowerCase()))
        : allServices;

    async function selectService(service: Service) {
        setSelectedService(service.Title);
        setError(null);
        setResults([]);
        try {
            setResultsLoading(true);
            const data = await getCompaniesByService(service.ServiceID);
            setResults(data);
        } catch {
            setError("Нет компаний, предоставляющих эту услугу");
        } finally {
            setResultsLoading(false);
        }
    }

    function clearSelection() {
        setSelectedService(null);
        setResults([]);
        setError(null);
    }

    async function submitRequest(comment?: string) {
        if (!filter.trim()) return;
        try {
            setRequestSending(true);
            await createServiceRequest(filter.trim(), comment);
            setRequestSent(true);
        } catch {
            setError("Не удалось отправить заявку");
        } finally {
            setRequestSending(false);
        }
    }

    function resetRequest() {
        setRequestSent(false);
        setFilter("");
    }

    async function handleBook(comment: string) {
        if (!pendingCompany) return;
        try {
            setBooking(true);
            setError(null);
            const created = await createBooking(comment.trim() || null, "requested");
            await createBookingService(created.BookingID, pendingCompany.CompanyServiceID);
            setBookingToast({ bookingId: created.BookingID, companyName: pendingCompany.Name });
            setResults([]);
            setSelectedService(null);
            setPendingCompany(null);
        } catch {
            setError("Не удалось создать бронирование");
        } finally {
            setBooking(false);
        }
    }

    return {
        filter,
        setFilter,
        allServices,
        filteredServices,
        servicesLoading,
        selectedService,
        results,
        resultsLoading,
        error,
        bookingToast,
        setBookingToast,
        requestSent,
        requestSending,
        pendingCompany,
        setPendingCompany,
        booking,
        selectService,
        clearSelection,
        handleBook,
        submitRequest,
        resetRequest,
    };
}
