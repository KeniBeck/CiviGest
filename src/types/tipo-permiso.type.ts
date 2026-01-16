
export interface CampoPersonalizado {
    name: string;
    type: string;
    required: boolean;
}

export interface TipoPermiso {
    id: number;
    sedeId: number;
    subsedeId: number;
    nombre: string;
    descripcion: string;
    camposPersonalizados: {
        fields: CampoPersonalizado[];
    };
    costoBase: string;
    numUMAsBase: string;
    numSalariosBase: string;
    vigenciaDefecto: number;
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
    _count: {
        permisos: number;
    };
}

export interface CreateTipoPermiso {
    nombre: string;
    descripcion: string;
    camposPersonalizados?: {
        fields: CampoPersonalizado[];
    };
    costoBase: number;
    numUMAsBase: number;
    numSalariosBase: number;
    vigenciaDefecto: number;
}

export interface UpdateTipoPermiso {
    nombre?: string;
    descripcion?: string;
    camposPersonalizados?: {
        fields: CampoPersonalizado[];
    };
    costoBase?: number;
    numUMAsBase?: number;
    numSalariosBase?: number;
    vigenciaDefecto?: number;
}

export interface GetTipoPermisoParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}