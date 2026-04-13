import { useEffect, useState } from "react";
import { getAllServices } from "../api/services";
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

    useEffect(() => {
        getAllServices()
            .then(setAllServices)
            .finally(() => setServicesLoading(false));
    }, []);

    const filteredServices = filter.trim()
        ? allServices.filter((s) => s.Title.toLowerCase().includes(filter.toLowerCase()))
        : allServices;

    async function selectService(title: string) {
        setSelectedService(title);
        setError(null);
        setResults([]);
        try {
            setResultsLoading(true);
            const data = await getCompaniesByService(title);
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

    async function handleBook(company: CompanyServiceResult) {
        try {
            setError(null);
            const booking = await createBooking(
                `Бронирование услуги "${selectedService}" в компании "${company.Name}"`,
                "requested"
            );
            await createBookingService(booking.BookingID, company.CompanyServiceID);
            setBookingToast({ bookingId: booking.BookingID, companyName: company.Name });
            setResults([]);
            setSelectedService(null);
        } catch {
            setError("Не удалось создать бронирование");
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
        selectService,
        clearSelection,
        handleBook,
        submitRequest,
        resetRequest,
    };
}
