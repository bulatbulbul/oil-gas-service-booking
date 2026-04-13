import api from "./client";
import type { CompanyService } from "../types";

export async function getMyCompanyServices(): Promise<CompanyService[]> {
    const res = await api.get("/company-services/my");
    return Array.isArray(res.data) ? res.data : [];
}

export async function createCompanyService(companyId: number, serviceId: number): Promise<void> {
    await api.post("/company-services", { company_id: companyId, service_id: serviceId });
}

export async function deleteCompanyService(id: number): Promise<void> {
    await api.delete(`/company-services/${id}`);
}
