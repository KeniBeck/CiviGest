export interface Agente {
    id: number;
    sedeId: number;
    subsedeId: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    tipoId: number;
    cargo: string;
    numPlantilla: string;
    numEmpleadoBiometrico: string;
    foto: string;
    whatsapp: number;
    correo: string;
    contrasena: string;
    departamentoId: number;
    patrullaId: number | null;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
    sede: {
        name: string;
        code: string;
    },
    subsede: {
        name: string;
        code: string;
    },
    tipo: {
        tipo: string;
    },
    departamento: {
        nombre: string;
    },
    patrulla: {
        numPatrulla: string;
    }
}

export interface CreateAgente {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    tipoId: number;
    cargo: string;
    numPlantilla: string;
    numEmpleadoBiometrico: string;
    foto: string;
    whatsapp: number;
    correo: string;
    contrasena: string;
    departamentoId: number;
    patrullaId: number;
}

export interface UpdateAgente {
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    tipoId?: number;
    cargo?: string;
    numPlantilla?: string;
    numEmpleadoBiometrico?: string;
    foto?: string;
    whatsapp?: number;
    correo?: string;
    contrasena?: string;
    departamentoId?: number;
    patrullaId?: number;
}

export interface GetAgentesParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    tipoId?: number;
    departamentoId?: number;
    patrullaId?: number;
}
