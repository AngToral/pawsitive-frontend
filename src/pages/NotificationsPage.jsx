import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationsAsRead
    } = useNotification();
    const hasMarkedAsRead = useRef(false);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Efecto separado para marcar como leídas
    useEffect(() => {
        if (unreadCount > 0 && !hasMarkedAsRead.current) {
            markNotificationsAsRead();
            hasMarkedAsRead.current = true;
        }
    }, [unreadCount, markNotificationsAsRead]);

    const handleNotificationClick = (notification) => {
        switch (notification.type) {
            case 'like':
            case 'comment':
                navigate(`/post/${notification.post._id}`);
                break;
            case 'follow':
                navigate(`/profile/${notification.sender._id}`);
                break;
            default:
                break;
        }
    };

    const getNotificationText = (notification) => {
        switch (notification.type) {
            case 'like':
                return `le dio like a tu publicación`;
            case 'comment':
                return `comentó en tu publicación: "${notification.comment?.text}"`;
            case 'follow':
                return `comenzó a seguirte`;
            default:
                return '';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Notificaciones</h1>
            {unreadCount > 0 && (
                <p className="text-blue-600 mb-4">
                    {unreadCount} notificaciones sin leer
                </p>
            )}

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-gray-500">No tienes notificaciones</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 rounded-lg shadow cursor-pointer transition-colors
                                ${notification.read ? 'bg-white' : 'bg-blue-50'}
                                hover:bg-gray-50`}
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={notification.sender.profilePicture}
                                    alt={notification.sender.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                    style={{ height: '50px' }}
                                />
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            {notification.sender.username}
                                        </span>{' '}
                                        {getNotificationText(notification)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                            addSuffix: true,
                                            locale: es
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 