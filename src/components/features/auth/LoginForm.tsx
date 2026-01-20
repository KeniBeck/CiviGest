import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/queries/useAuth';
import { loginSchema } from '@/utils/validators';
import type { LoginFormData } from '@/utils/validators';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="space-y-4 text-center pb-6">
        {/* Logo con efecto de elevación */}
        <div className="flex justify-center">
          <div className="relative">
            <div 
              className="absolute inset-0 blur-xl opacity-30 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <img
              src="/tu ciudaddigital LOGO sin nombre.svg"
              alt="Tu Ciudad Digital"
              className="relative h-24 w-24 object-contain drop-shadow-lg rounded-xl"
            />
          </div>
        </div>
        
        {/* Título y Subtítulo */}
        <div className="space-y-2">
          <CardTitle 
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            Tu Ciudad Digital
          </CardTitle>
          <CardDescription className="text-base">
            Sistema de Gestión Municipal
          </CardDescription>
          <div 
            className="h-1 w-20 mx-auto rounded-full mt-3"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Subtítulo de sección */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Iniciar Sesión
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ingresa tus credenciales de acceso
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FloatingInput
              id="email"
              type="email"
              label="Email"
              {...register('email')}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <FloatingInput
              id="password"
              type="password"
              label="Contraseña"
              {...register('password')}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400 flex items-start gap-2">
              <svg className="h-5 w-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>
                {(error as any)?.response?.data?.message ||
                  'Error al iniciar sesión. Verifica tus credenciales.'}
              </span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cargando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
