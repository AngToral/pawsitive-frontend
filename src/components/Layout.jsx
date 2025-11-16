import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar'

const SOCKET_URL = import.meta.env.VITE_BACKEND || 'http://localhost:3000';

export default function Layout({ children }) {
    const { user } = useAuth();
    const { showMessageNotification, showNotification, fetchNotifications } = useNotification();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        console.log('Iniciando conexión del socket...');
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket']
        });

        // Eventos de conexión
        socketRef.current.on('connect', () => {
            console.log('Socket conectado exitosamente');

            // Unirse con el userId cuando se conecta
            if (user?._id) {
                console.log('Enviando evento join con userId:', user._id);
                socketRef.current.emit('join', user._id);
            }
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Error de conexión del socket:', error);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('Socket desconectado:', reason);
            // Intentar reconectar si la desconexión no fue intencional
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                console.log('Desconexión intencional, no reconectando');
            } else {
                console.log('Intentando reconectar...');
                socketRef.current.connect();
            }
        });

        // Escuchar mensajes recibidos
        socketRef.current.on('receiveMessage', (message) => {
            console.log('Mensaje recibido en Layout:', message);

            // Mostrar notificación y navegar a mensajes al hacer clic
            showMessageNotification(message, () => {
                navigate('/messages');
            });
        });

        // Escuchar notificaciones de likes
        socketRef.current.on('postLiked', (notification) => {
            console.log('Notificación de like recibida:', notification);
            showNotification(notification, () => {
                navigate(`/post/${notification.post}`);
            });
            fetchNotifications();
        });

        // Escuchar notificaciones de comentarios
        socketRef.current.on('postCommented', (notification) => {
            console.log('Notificación de comentario recibida:', notification);
            showNotification(notification, () => {
                navigate(`/post/${notification.post}`);
            });
            fetchNotifications();
        });

        // Escuchar notificaciones de nuevos seguidores
        socketRef.current.on('newFollower', (notification) => {
            console.log('Notificación de nuevo seguidor recibida:', notification);
            showNotification(notification, () => {
                navigate(`/profile/${notification.sender._id}`);
            });
            fetchNotifications();
        });

        // Suscribirse a notificaciones
        socketRef.current.emit('subscribeToNotifications', user._id);

        return () => {
            if (socketRef.current) {
                console.log('Limpiando conexión del socket');
                socketRef.current.disconnect();
            }
        };
    }, [user?._id, showMessageNotification, showNotification, navigate, fetchNotifications]);

    return (
        <div className="flex">
            <Toaster position="top-right" />
            <Navbar />
            <main className="flex-1 md:ml-64 pb-32 md:pb-0 w-full">
                {children}
            </main>
        </div>
    );
} 