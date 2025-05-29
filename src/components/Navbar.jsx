import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiHome, HiMagnifyingGlass, HiPlus, HiBell, HiChatBubbleOvalLeftEllipsis, HiUser } from 'react-icons/hi2'

export default function Navbar() {
    const { user } = useAuth()
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
        <nav className="fixed left-0 top-0 w-64 h-screen border-r border-gray-200 bg-white">
            <div className="px-6 py-8">
                <Link to="/" className="block">
                    <h1 className="text-2xl font-bold text-primary-500">Pawsitive</h1>
                </Link>
            </div>

            <div className="px-3 space-y-1">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center px-3 py-3 text-base rounded-lg transition-colors ${location.pathname === item.path ? 'font-bold' : 'hover:bg-gray-100'
                            }`}
                    >
                        <span className={location.pathname === item.path ? 'text-gray-900' : 'text-gray-500'}>
                            {item.icon}
                        </span>
                        <span className="ml-4">{item.label}</span>
                    </Link>
                ))}

                <Link
                    to="/profile"
                    className={`flex items-center px-3 py-3 text-base rounded-lg transition-colors ${location.pathname === '/profile' ? 'font-bold' : 'hover:bg-gray-100'
                        }`}
                >
                    {user?.profilePicture ? (
                        <img
                            src={`${user.profilePicture}?${new Date().getTime()}`}
                            alt={user?.fullName}
                            style={{ height: '30px', width: '30px', borderRadius: '50%', objectFit: 'cover' }}
                            className="aspect-square"
                        />
                    ) : (
                        <HiUser style={{ width: '25px', height: '25px' }} className="text-gray-500" />
                    )}
                    <span className="ml-4">Perfil</span>
                </Link>
            </div>
        </nav>
    )
} 