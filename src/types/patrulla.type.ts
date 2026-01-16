export interface Patrulla {
    id: number;
    sedeId: number;
    subsedeId: number;
    marca: string;
    modelo: string;
    placa: string;
    numPatrulla: string;
    serie: string;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
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
    agentes: Array<{
        id: number;
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
    }>;
}

export interface CreatePatrulla {
    marca: string,
    modelo: string,
    placa: string,
    numPatrulla: string,
    serie: string
}

export interface UpdatePatrulla {
    marca?: string,
    modelo?: string,
    placa?: string,
    numPatrulla?: string,
    serie?: string
}

export interface GetPatrullaParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}