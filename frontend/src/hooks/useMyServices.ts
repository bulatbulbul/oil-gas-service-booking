import { useEffect, useState } from "react";
import { getMyCompanies } from "../api/companies";
import { createService, updateService } from "../api/services";
import { getMyCompanyServices, createCompanyService, deleteCompanyService } from "../api/companyServices";
import type { Company, CompanyService } from "../types";

export function useMyServices() {
    const [items, setItems] = useState<CompanyService[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    async function load() {
        try {
            setLoading(true);
            const [myItems, myCompanies] = await Promise.all([
                getMyCompanyServices(),
                getMyCompanies(),
            ]);
            setItems(myItems);
            setCompanies(myCompanies);
        } catch {
            setError("Не удалось загрузить услуги");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(companyId: number, serviceTitle: string) {
        if (!serviceTitle.trim()) return;
        try {
            setCreating(true);
            const svc = await createService(serviceTitle.trim());
            await createCompanyService(companyId, svc.ServiceID);
            await load();
        } catch {
            alert("Не удалось добавить услугу");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateService(serviceId: number, title: string) {
        if (!title.trim()) return;
        try {
            await updateService(serviceId, title.trim());
            await load();
        } catch {
            alert("Не удалось переименовать услугу");
        }
    }

    async function handleDelete(csId: number) {
        if (!confirm("Удалить услугу у компании?")) return;
        try {
            await deleteCompanyService(csId);
            await load();
        } catch {
            alert("Не удалось удалить услугу");
        }
    }

    return { items, companies, loading, error, creating, handleCreate, handleUpdateService, handleDelete };
}
