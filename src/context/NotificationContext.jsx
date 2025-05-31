import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { HiUser } from 'react-icons/hi2';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { user } = useAuth();

    const showMessageNotification = (message, onClickCallback) => {
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
                if (onClickCallback) {
                    onClickCallback();
                }
                toast.dismiss();
            },
        });
    };

    const value = {
        showMessageNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
} 