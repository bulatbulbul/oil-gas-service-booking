import api from "./client";
import type { Company } from "../types";

export async function getMyCompanies(): Promise<Company[]> {
    const res = await api.get("/companies/my");
    return Array.isArray(res.data) ? res.data : [];
}

export async function createCompany(name: string): Promise<Company> {
    const res = await api.post("/companies", { name });
    return res.data;
}

export async function updateCompany(id: number, name: string): Promise<void> {
    await api.put(`/companies/${id}`, { name });
}

export async function deleteCompany(id: number): Promise<void> {
    await api.delete(`/companies/${id}`);
}

export async function uploadCompanyLogo(id: number, file: File): Promise<{ logo_url: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post(`/upload/companies/${id}/logo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}
