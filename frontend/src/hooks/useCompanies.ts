import { useEffect, useRef, useState } from "react";
import { getMyCompanies, createCompany, updateCompany, deleteCompany, uploadCompanyLogo } from "../api/companies";
import type { Company } from "../types";

export function useCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [logoUploading, setLogoUploading] = useState<number | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const uploadingForIdRef = useRef<number | null>(null);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            setCompanies(await getMyCompanies());
        } catch {
            setError("Не удалось загрузить компании");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(name: string) {
        if (!name.trim()) return;
        try {
            setCreating(true);
            await createCompany(name.trim());
            await load();
        } catch {
            alert("Не удалось создать компанию");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdate(id: number, name: string) {
        if (!name.trim()) return;
        try {
            await updateCompany(id, name.trim());
            await load();
        } catch {
            alert("Не удалось обновить компанию");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Удалить компанию?")) return;
        try {
            await deleteCompany(id);
            await load();
        } catch {
            alert("Не удалось удалить компанию");
        }
    }

    function openLogoUpload(companyId: number) {
        uploadingForIdRef.current = companyId;
        logoInputRef.current?.click();
    }

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        const companyId = uploadingForIdRef.current;
        if (!file || companyId === null) return;
        try {
            setLogoUploading(companyId);
            const { logo_url } = await uploadCompanyLogo(companyId, file);
            setCompanies(prev => prev.map(c => c.CompanyID === companyId ? { ...c, logo_url } : c));
        } catch {
            alert("Не удалось загрузить логотип");
        } finally {
            setLogoUploading(null);
            uploadingForIdRef.current = null;
            if (logoInputRef.current) logoInputRef.current.value = "";
        }
    }

    return {
        companies, loading, error, creating,
        handleCreate, handleUpdate, handleDelete,
        logoUploading, logoInputRef, openLogoUpload, handleLogoChange,
    };
}
