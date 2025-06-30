import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationsAsRead
    } = useNotification();
    const hasMarkedAsRead = useRef(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setIsLoading(true);
                setError(null);
                await fetchNotifications();
            } catch (err) {
                console.error('Error al cargar notificaciones:', err);
                setError('Error al cargar las notificaciones');
                toast.error('Error al cargar las notificaciones');
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, [fetchNotifications]);

    // Filtrar las notificaciones de tipo mensaje
    const filteredNotifications = notifications.filter(notification => notification.type !== 'message');

    useEffect(() => {
        const markAsRead = async () => {
            if (unreadCount > 0 && !hasMarkedAsRead.current) {
                try {
                    await markNotificationsAsRead();
                    hasMarkedAsRead.current = true;
                } catch (err) {
                    console.error('Error al marcar notificaciones como leídas:', err);
                }
            }
        };

        markAsRead();
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

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-8">
                    {error}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            ) : (
                <>
                    {unreadCount > 0 && (
                        <p className="text-blue-600 mb-4">
                            {unreadCount} notificaciones sin leer
                        </p>
                    )}

                    <div className="space-y-4">
                        {filteredNotifications.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tienes notificaciones</p>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 rounded-lg shadow cursor-pointer transition-colors
                                        ${notification.read ? 'bg-gray-600' : 'bg-pink-800'}
                                        hover:bg-gray-400`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={notification.sender.profilePicture}
                                            alt={notification.sender.username}
                                            className="w-10 h-10 rounded-full object-contain"
                                            style={{ height: '50px' }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                <span className="font-semibold">
                                                    {notification.sender.username}
                                                </span>{' '}
                                                {getNotificationText(notification)}
                                            </p>
                                            <p className="text-xs mt-1">
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
                </>
            )}
        </div>
    );
} 