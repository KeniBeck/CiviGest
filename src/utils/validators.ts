import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Agente login form validation schema
 */
export const agenteLoginSchema = z.object({
  numPlaca: z
    .string()
    .min(1, 'El número de placa es requerido')
    .regex(/^[A-Z0-9-]+$/i, 'Formato de placa inválido'),
  contrasena: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type AgenteLoginFormData = z.infer<typeof agenteLoginSchema>;
