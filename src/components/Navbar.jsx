import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiHome, HiMagnifyingGlass, HiPlus, HiBell, HiChatBubbleOvalLeftEllipsis, HiUser, HiArrowRightOnRectangle } from 'react-icons/hi2'

export default function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const menuItems = [
        {
            icon: <HiHome className="w-6 h-6" />,
            label: 'Inicio',
            path: '/'
        },
        {
            icon: <HiMagnifyingGlass className="w-6 h-6" />,
            label: 'Buscar',
            path: '/search'
        },
        {
            icon: <HiPlus className="w-6 h-6" />,
            label: 'Crear',
            path: '/create'
        },
        {
            icon: <HiBell className="w-6 h-6" />,
            label: 'Notificaciones',
            path: '/notifications'
        },
        {
            icon: <HiChatBubbleOvalLeftEllipsis className="w-6 h-6" />,
            label: 'Mensajes',
            path: '/messages'
        }
    ]

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-[#1c1c1c] border-t border-gray-600 py-3 md:top-0 md:left-0 md:w-64 md:h-screen md:border-r md:border-t-0 md:py-0">
            <div className="flex flex-row justify-around items-center md:flex-col md:justify-start md:h-full md:p-4">
                <Link to="/profile" className="flex items-center justify-center px-3 py-2 text-base rounded-lg transition-colors hover:bg-gray-100 flex-1 md:flex-initial md:w-full md:justify-start">
                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt={user.fullName}
                            style={{
                                height: '30px',
                                width: '30px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <HiUser style={{ width: '25px', height: '25px' }} className="text-gray-500" />
                    )}
                    <span className="ml-4 hidden md:block">Perfil</span>
                </Link>

                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center justify-center px-3 py-2 text-base rounded-lg transition-colors hover:bg-gray-100 flex-1 md:flex-initial md:w-full md:justify-start ${location.pathname === item.path ? 'text-primary-500' : 'text-gray-500'
                            }`}
                    >
                        {item.icon}
                        <span className="ml-4 hidden md:block">{item.label}</span>
                    </Link>
                ))}

                <button
                    onClick={logout}
                    className="flex items-center justify-center px-3 py-2 text-base rounded-lg transition-colors hover:bg-gray-100 flex-1 md:flex-initial md:w-full md:justify-start text-left text-gray-500"
                >
                    <HiArrowRightOnRectangle className="w-6 h-6" />
                    <span className="ml-4 hidden md:block">Cerrar sesión</span>
                </button>
            </div>
        </nav>
    )
} 