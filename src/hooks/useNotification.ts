import { useNotificationStore } from '@/stores/notificationStore';

export const useNotification = () => {
  const { addNotification } = useNotificationStore();

  const notify = {
    success: (title: string, message: string, duration = 5000) => {
      addNotification({ type: 'success', title, message, duration });
    },
    
    error: (title: string, message: string, duration = 7000) => {
      addNotification({ type: 'error', title, message, duration });
    },
    
    warning: (title: string, message: string, duration = 6000) => {
      addNotification({ type: 'warning', title, message, duration });
    },
    
    info: (title: string, message: string, duration = 5000) => {
      addNotification({ type: 'info', title, message, duration });
    },

    // Para errores de API - Extrae el mensaje del backend automáticamente
    apiError: (error: any) => {
      let message = 'Ha ocurrido un error inesperado';
      
      // Intentar extraer el mensaje del error
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      
      addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 7000,
      });
    },
  };

  return notify;
};
