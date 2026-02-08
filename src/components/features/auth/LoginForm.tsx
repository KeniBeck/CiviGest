import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Shield, User, ArrowRight, Fingerprint } from 'lucide-react';
import { useLogin, useLoginAgente } from '@/hooks/queries/useAuth';
import { loginSchema, agenteLoginSchema } from '@/utils/validators';
import type { LoginFormData, AgenteLoginFormData } from '@/utils/validators';
import { FloatingInput } from '@/components/ui/floating-input';

export function LoginForm() {
  const [isAgente, setIsAgente] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  const { mutate: login, isPending: isPendingUser, error: errorUser } = useLogin();
  const { mutate: loginAgente, isPending: isPendingAgente, error: errorAgente } = useLoginAgente();
  const [showPassword, setShowPassword] = useState(false);

  const isPending = isPendingUser || isPendingAgente;
  const error = errorUser || errorAgente;

  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: errorsUser },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerAgente,
    handleSubmit: handleSubmitAgente,
    formState: { errors: errorsAgente },
  } = useForm<AgenteLoginFormData>({
    resolver: zodResolver(agenteLoginSchema),
  });

  const onSubmitUser = (data: LoginFormData) => {
    login(data);
  };

  const onSubmitAgente = (data: AgenteLoginFormData) => {
    loginAgente(data);
  };

  // Animated toggle with smooth form transition
  const handleModeSwitch = (agente: boolean) => {
    if (agente === isAgente || isPending) return;
    setIsTransitioning(true);
    setFormVisible(false);
    
    setTimeout(() => {
      setIsAgente(agente);
      setTimeout(() => {
        setFormVisible(true);
        setIsTransitioning(false);
      }, 50);
    }, 280);
  };

  // Floating particles effect for background ambiance
  const [particles] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 30,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="w-full max-w-[440px] mx-auto px-4 sm:px-0">
      {/* Main Card - Apple Neumorphic */}
      <div 
        className="relative overflow-hidden rounded-[32px] sm:rounded-[40px]"
        style={{
          background: 'var(--color-surface, #e8ecf1)',
          boxShadow: `
            20px 20px 60px rgba(163, 177, 198, 0.5),
            -20px -20px 60px rgba(255, 255, 255, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.6)
          `,
        }}
      >
        {/* Ambient floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full opacity-[0.04]"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: isAgente ? 'var(--color-primary)' : '#6366f1',
                animation: `loginFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
                transition: 'background-color 0.8s ease',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:px-10 sm:py-7">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="relative group">
              {/* Glow ring */}
              <div 
                className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              {/* Neumorphic logo container */}
              <div 
                className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-[18px] sm:rounded-[20px] flex items-center justify-center transition-all duration-500"
                style={{
                  background: 'var(--color-surface, #e8ecf1)',
                  boxShadow: `
                    8px 8px 20px rgba(163, 177, 198, 0.5),
                    -8px -8px 20px rgba(255, 255, 255, 0.6),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5)
                  `,
                }}
              >
                <img
                  src="/tu ciudaddigital LOGO sin nombre.svg"
                  alt="Tu Ciudad Digital"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 sm:mb-5 space-y-1">
            <h1 
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-primary)' }}
            >
              Tu Ciudad Digital
            </h1>
            <p className="text-sm sm:text-[15px] font-medium text-gray-500">
              Sistema de Gestión Municipal
            </p>
          </div>

          {/* Mode Selector - Pill Toggle */}
          <div className="mb-5 sm:mb-6">
            <div 
              className="relative flex items-center rounded-2xl p-1.5 mx-auto max-w-[300px]"
              style={{
                background: 'var(--color-surface, #e0e5ec)',
                boxShadow: `
                  inset 4px 4px 10px rgba(163, 177, 198, 0.45),
                  inset -4px -4px 10px rgba(255, 255, 255, 0.45)
                `,
              }}
            >
              {/* Sliding indicator */}
              <div 
                className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  width: 'calc(50% - 6px)',
                  left: isAgente ? 'calc(50% + 3px)' : '6px',
                  background: 'var(--color-surface, #e8ecf1)',
                  boxShadow: `
                    6px 6px 14px rgba(163, 177, 198, 0.45),
                    -6px -6px 14px rgba(255, 255, 255, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6)
                  `,
                }}
              />
              
              {/* Usuario Button */}
              <button
                type="button"
                onClick={() => handleModeSwitch(false)}
                disabled={isPending}
                className={`
                  relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl 
                  font-semibold text-sm sm:text-[15px] transition-all duration-500 select-none
                  ${!isAgente 
                    ? 'text-gray-800' 
                    : 'text-gray-400 hover:text-gray-500'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <User className={`h-4 w-4 transition-transform duration-500 ${!isAgente ? 'scale-110' : 'scale-90'}`} />
                <span>Usuario</span>
              </button>

              {/* Agente Button */}
              <button
                type="button"
                onClick={() => handleModeSwitch(true)}
                disabled={isPending}
                className={`
                  relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl 
                  font-semibold text-sm sm:text-[15px] transition-all duration-500 select-none
                  ${isAgente 
                    ? 'text-gray-800' 
                    : 'text-gray-400 hover:text-gray-500'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Shield className={`h-4 w-4 transition-transform duration-500 ${isAgente ? 'scale-110' : 'scale-90'}`} />
                <span>Agente</span>
              </button>
            </div>
          </div>

          {/* Form Area with transition */}
          <div
            ref={formRef}
            className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              opacity: formVisible ? 1 : 0,
              transform: formVisible 
                ? 'translateY(0) scale(1)' 
                : `translateY(${isAgente ? '-12px' : '12px'}) scale(0.97)`,
              filter: formVisible ? 'blur(0px)' : 'blur(4px)',
            }}
          >
            <form 
              onSubmit={isAgente ? handleSubmitAgente(onSubmitAgente) : handleSubmitUser(onSubmitUser)} 
              className="space-y-3.5 sm:space-y-4"
            >
              {/* Identity Field */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <div 
                    className="absolute -inset-0.5 rounded-[14px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <div className="relative">
                    {!isAgente ? (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors duration-300 z-10" />
                    ) : (
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors duration-300 z-10" />
                    )}
                    <FloatingInput
                      id={isAgente ? 'numPlaca' : 'email'}
                      type={isAgente ? 'text' : 'email'}
                      label={isAgente ? 'Número de Placa' : 'Correo electrónico'}
                      className={`pl-12 h-[52px] sm:h-14 rounded-xl text-[15px] ${isAgente ? 'uppercase' : ''}`}
                      hasLeftIcon={true}
                      {...(isAgente ? registerAgente('numPlaca') : registerUser('email'))}
                      disabled={isPending}
                    />
                  </div>
                </div>
                {!isAgente && errorsUser.email && (
                  <p className="text-xs font-medium text-red-500 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    {errorsUser.email.message}
                  </p>
                )}
                {isAgente && errorsAgente.numPlaca && (
                  <p className="text-xs font-medium text-red-500 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    {errorsAgente.numPlaca.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <div 
                    className="absolute -inset-0.5 rounded-[14px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors duration-300 z-10" />
                    <FloatingInput
                      id={isAgente ? 'contrasena' : 'password'}
                      type={showPassword ? 'text' : 'password'}
                      label="Contraseña"
                      className="pl-12 pr-12 h-[52px] sm:h-14 rounded-xl text-[15px]"
                      hasLeftIcon={true}
                      hasRightIcon={true}
                      {...(isAgente ? registerAgente('contrasena') : registerUser('password'))}
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-90 transition-all duration-200 z-10"
                      tabIndex={-1}
                    >
                      <div className="relative h-5 w-5">
                        <Eye className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${showPassword ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                        <EyeOff className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${showPassword ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>
                {!isAgente && errorsUser.password && (
                  <p className="text-xs font-medium text-red-500 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    {errorsUser.password.message}
                  </p>
                )}
                {isAgente && errorsAgente.contrasena && (
                  <p className="text-xs font-medium text-red-500 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    {errorsAgente.contrasena.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="rounded-2xl p-4 text-sm flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300"
                  style={{
                    background: 'var(--color-surface, #e8ecf1)',
                    boxShadow: `
                      inset 3px 3px 8px rgba(220, 38, 38, 0.1),
                      inset -3px -3px 8px rgba(255, 255, 255, 0.4)
                    `,
                    border: '1px solid rgba(220, 38, 38, 0.15)',
                  }}
                >
                  <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-red-700 font-medium text-[13px] leading-relaxed">
                    {(error as any)?.response?.data?.message ||
                      'Error al iniciar sesión. Verifica tus credenciales.'}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1 sm:pt-2">
                <button 
                  type="submit" 
                  disabled={isPending || isTransitioning}
                  className="
                    group relative w-full h-12 sm:h-13 rounded-2xl font-semibold text-[15px] sm:text-base 
                    text-white overflow-hidden transition-all duration-300 
                    disabled:opacity-60 disabled:cursor-not-allowed
                    active:scale-[0.98]
                  "
                  style={{
                    background: isPending 
                      ? 'var(--color-primary)' 
                      : `linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, #000) 100%)`,
                    boxShadow: `
                      0 8px 32px color-mix(in srgb, var(--color-primary) 40%, transparent),
                      0 2px 8px color-mix(in srgb, var(--color-primary) 20%, transparent),
                      inset 0 1px 0 rgba(255,255,255,0.2)
                    `,
                  }}
                >
                  {/* Hover shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700" />
                  
                  {isPending ? (
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Iniciando sesión...</span>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {isAgente ? (
                        <>
                          <Shield className="h-[18px] w-[18px]" />
                          <span>Acceder como Agente</span>
                        </>
                      ) : (
                        <span>Iniciar Sesión</span>
                      )}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Mode indicator dot */}
          <div className="flex justify-center mt-4 sm:mt-5 gap-2">
            <div 
              className="h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                width: !isAgente ? 24 : 8,
                backgroundColor: !isAgente ? 'var(--color-primary)' : 'rgba(163,177,198,0.4)',
              }}
            />
            <div 
              className="h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                width: isAgente ? 24 : 8,
                backgroundColor: isAgente ? 'var(--color-primary)' : 'rgba(163,177,198,0.4)',
              }}
            />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes loginFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -20px) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
