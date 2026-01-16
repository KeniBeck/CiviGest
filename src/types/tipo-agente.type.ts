export interface TipoAgente {
    id: number;
    sedeId: number;
    subsedeId: number;
    tipo: string;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
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
        agentes: number;
    }
}

export interface CreateTipoAgente {
    tipo: string;
}

export interface UpdateTipoAgente {
    tipo?: string;
}

export interface GetTipoAgenteParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}
