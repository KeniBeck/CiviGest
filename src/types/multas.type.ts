export interface Multas {
    id: number;
    sedeId: number;
    subsedeId: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    costo: string;
    numUMAs: string;
    numSalarios: string;
    recargo: string;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
    departamentoId: number;
    sede: {
        id: number;
        name: string;
        code: string;
    };
    subsede: {
        id: number;
        name: string;
        code: string;
    };
    departamento: {
        id: number;
        nombre: string;
        descripcion: string;
    };
}

export interface CreateMultas {
    nombre: string;
    codigo: string;
    departamentoId: number;
    descripcion: string;
    costo: number;
    numUMAs: number;
    numSalarios: number;
    recargo: number;
}

export interface UpdateMultas {
    nombre: string;
    codigo: string;
    departamentoId: number;
    descripcion: string;
    costo: number;
    numUMAs: number;
    numSalarios: number;
    recargo: number;
}

export interface GetMultasParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    departamentoId?: number;
    departamento?: string;
}

