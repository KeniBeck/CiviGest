import type { Theme } from './theme.types';

export interface Configuracion {
  id: number;
  sedeId: number;
  subsedeId: number;
  nombreCliente: string;
  pais: string;
  ciudad: string;
  logo: string;
  slogan: string;
  titular: string;
  themeId: number;
  salarioMinimo: string;
  uma: string;
  correoContacto: string;
  whatsappContacto: string;
  telContacto: string;
  correoAtencion: string;
  whatsappAtencion: string;
  telAtencion: string;
  tasaRecargo: string;
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
    sedeId: number;
    name: string;
    code: string;
  };
  theme: Theme;
}
