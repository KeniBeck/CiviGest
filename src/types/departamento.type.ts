export interface Departamento {
    id: number;
    sedeId: number;
    subsedeId: number;
    nombre: string;
    descripcion: string;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    sede: {
        id: number;
        name: string;
        code: string;
    },
    subsede: {
        id: number;
        name: string;
        code: string;
    },
    _count: {
        multas: number;
    }
}

export interface CreateDepartamento {
    nombre: string;
    descripcion: string;
}

export interface UpdateDepartamento {
    nombre: string;
    descripcion: string;
}

export interface GetDepartamentoParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}