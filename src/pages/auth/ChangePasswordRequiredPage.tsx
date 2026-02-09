import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES } from '@/config/routes';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordRequiredPage() {
  const navigate = useNavigate();
  const { isAgente, user, clearAuth } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      if (isAgente) {
        await authService.changeAgentePassword(payload);
      } else {
        await authService.changePassword(payload);
      }

      addNotification({
        type: 'success',
        title: 'Contraseña actualizada',
        message: 'Tu contraseña ha sido actualizada correctamente. Por seguridad, debes iniciar sesión nuevamente.',
      });

      // Cerrar sesión y redirigir a login
      setTimeout(() => {
        clearAuth();
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al cambiar contraseña',
        message: error?.response?.data?.message || 'Ocurrió un error al cambiar la contraseña',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.requirePasswordChange) {
    navigate(ROUTES.DASHBOARD);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="relative">
              <div 
                className="absolute inset-0 blur-xl opacity-30 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <KeyRound className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Cambio de Contraseña Requerido
            </CardTitle>
            <CardDescription className="text-base">
              Por seguridad, debes cambiar tu contraseña antes de continuar
            </CardDescription>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-800 dark:text-orange-300 text-left">
              Esta es tu primera vez iniciando sesión o un administrador requiere que actualices tu contraseña.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contraseña Actual */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <FloatingInput
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Contraseña Actual"
                  className="pl-11 pr-11"
                  hasLeftIcon={true}
                  hasRightIcon={true}
                  {...register('currentPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <FloatingInput
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  label="Nueva Contraseña"
                  className="pl-11 pr-11"
                  hasLeftIcon={true}
                  hasRightIcon={true}
                  {...register('newPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <FloatingInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmar Nueva Contraseña"
                  className="pl-11 pr-11"
                  hasLeftIcon={true}
                  hasRightIcon={true}
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Actualizando...
                </span>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
