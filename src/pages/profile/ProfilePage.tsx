import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar,
  IdCard,
  Building2,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUser } from '@/hooks/queries/useUsers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChangeOwnPasswordModal } from '@/components/features/users/ChangeOwnPasswordModal';

const ProfilePage = () => {
  const { user: authUser } = useAuthStore();
  const { data: userData, isLoading } = useUser(authUser?.id || 0);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No se pudo cargar la información del perfil</p>
      </div>
    );
  }

  const initials = `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();

  // Helper para colores de roles
  const getRoleVariant = (level: string) => {
    switch (level) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'ESTATAL':
        return 'default';
      case 'MUNICIPAL':
        return 'secondary';
      case 'OPERATIVO':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,1)] p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-[8px_8px_16px_rgba(0,0,0,0.1),-4px_-4px_12px_rgba(255,255,255,0.8)] ring-4 ring-white">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg ring-4 ring-white">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-500 font-medium mb-3">@{userData.username}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {userData.roles.map((r, idx) => (
                  <Badge key={idx} variant={getRoleVariant(r.role.level)} className="text-xs px-3 py-1">
                    {r.role.name}
                  </Badge>
                ))}
                <Badge 
                  variant="outline" 
                  className="text-xs px-3 py-1 border-green-300 text-green-700 bg-green-50"
                >
                  {userData.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl shadow-[4px_4px_12px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,1)] hover:shadow-[2px_2px_8px_rgba(0,0,0,0.12),-2px_-2px_8px_rgba(255,255,255,1)] border-0 bg-gradient-to-br from-white to-gray-50"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Cambiar Contraseña
              </Button>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-inner">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{userData.email}</p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {userData.phoneCountryCode} {userData.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Documento */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <IdCard className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium mb-1">Documento</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {userData.documentType}: {userData.documentNumber}
                  </p>
                </div>
              </div>

              {/* Dirección */}
              {userData.address && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-1">Dirección</p>
                    <p className="text-sm text-gray-900 font-medium">{userData.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-inner">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Información del Sistema</h2>
            </div>

            <div className="space-y-4">
              {/* Nivel de Acceso */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium mb-1">Nivel de Acceso</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {userData.accessLevel === 'SEDE' ? 'Estatal (Sede)' : 'Municipal (Subsede)'}
                  </p>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium mb-1">Estado</p>
                  <p className="text-sm text-gray-900 font-medium">{userData.sede?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Municipio */}
              {userData.subsede && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-1">Municipio</p>
                    <p className="text-sm text-gray-900 font-medium">{userData.subsede.name}</p>
                  </div>
                </div>
              )}

              {/* Fecha de Creación */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium mb-1">Miembro desde</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(userData.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Último inicio de sesión */}
              {userData.lastLoginAt && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-1">Último acceso</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(userData.lastLoginAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accesos (si tiene) */}
        {((userData.subsedeAccess && userData.subsedeAccess.length > 0) || 
          (userData.sedeAccess && userData.sedeAccess.length > 0)) && (
          <div className="bg-white rounded-3xl shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-inner">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Accesos Autorizados</h2>
            </div>

            {userData.subsedeAccess && userData.subsedeAccess.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Municipios:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {userData.subsedeAccess.map((access) => (
                    <div
                      key={access.id}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-sm text-gray-900 font-medium text-center"
                    >
                      {access.subsede.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de cambio de contraseña */}
      <ChangeOwnPasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </div>
  );
};

export default ProfilePage;
