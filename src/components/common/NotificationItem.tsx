import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore, type Notification } from '@/stores/notificationStore';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { removeNotification } = useNotificationStore();

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <div
      className={`
        ${colors[notification.type]} 
        border rounded-lg shadow-lg p-4 mb-3 
        animate-in slide-in-from-right duration-300
        min-w-[320px] max-w-md
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`${iconColors[notification.type]} shrink-0`}>
          {icons[notification.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {notification.title}
          </h4>
          <p className="text-sm opacity-90 break-words">
            {notification.message}
          </p>
        </div>

        <button
          onClick={() => removeNotification(notification.id)}
          className="text-current opacity-60 hover:opacity-100 transition-opacity shrink-0"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
