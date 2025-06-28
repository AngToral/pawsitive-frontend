import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { HiUser } from 'react-icons/hi2';
import { api } from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const showMessageNotification = useCallback((message, onClick) => {
        // No mostrar notificación si el mensaje es del usuario actual
        if (message.sender._id === user?._id) return;

        const senderName = message.sender.username;
        toast.custom(() => (
            <div className="flex items-center gap-2">
                {message.sender.profilePicture ? (
                    <img
                        src={message.sender.profilePicture}
                        alt={senderName}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <HiUser style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                    </div>
                )}
                <div>
                    <p className="font-semibold">{senderName}</p>
                    <p className="text-sm text-gray-600 truncate">{message.content}</p>
                </div>
            </div>
        ), {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#fff',
                color: '#000',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            onClick: () => {
                if (onClick) {
                    onClick();
                }
                toast.dismiss();
            },
        });
    }, [user]);

    const showNotification = useCallback((notification, onClick) => {
        let message = '';
        switch (notification.type) {
            case 'like':
                message = `${notification.sender.username} le dio like a tu publicación`;
                break;
            case 'comment':
                message = `${notification.sender.username} comentó en tu publicación`;
                break;
            case 'follow':
                message = `${notification.sender.username} comenzó a seguirte`;
                break;
            default:
                return;
        }

        toast(message, {
            duration: 5000,
            onClick: onClick
        });
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.getNotifications();
            setNotifications(response.notifications);
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            toast.error('Error al cargar las notificaciones');
        }
    }, []);

    const markNotificationsAsRead = useCallback(async (notificationIds = null) => {
        try {
            // Si no hay notificaciones sin leer, no hacemos nada
            if (unreadCount === 0) {
                return;
            }

            // Si no se proporcionan IDs específicos, obtenemos los IDs de las notificaciones no leídas
            const idsToMark = notificationIds || notifications
                .filter(n => !n.read)
                .map(n => n._id);

            // Solo procedemos si hay notificaciones para marcar
            if (idsToMark.length > 0) {
                await api.markNotificationsAsRead(idsToMark);
                // Actualizamos el estado localmente antes de hacer el fetch
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        idsToMark.includes(notification._id)
                            ? { ...notification, read: true }
                            : notification
                    )
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error al marcar notificaciones como leídas:', error);
            toast.error('Error al marcar las notificaciones como leídas');
            // En caso de error, actualizamos para obtener el estado correcto
            await fetchNotifications();
        }
    }, [unreadCount, notifications]);

    const deleteNotifications = useCallback(async (notificationIds = null) => {
        try {
            await api.deleteNotifications(notificationIds);
            await fetchNotifications();
        } catch (error) {
            console.error('Error al eliminar notificaciones:', error);
            toast.error('Error al eliminar las notificaciones');
        }
    }, [fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        showMessageNotification,
        showNotification,
        fetchNotifications,
        markNotificationsAsRead,
        deleteNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 