import { Link, useLocation } from 'react-router-dom'

const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Inicio', path: '/' },
    { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', label: 'Explorar', path: '/explore' },
    { icon: 'M12 4v16m8-8H4', label: 'Crear', path: '/create' },
    { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: 'Actividad', path: '/activity' },
]

function Sidebar() {
    const location = useLocation()

    return (
        <div className="space-y-2 sticky top-4">
            {menuItems.map((item) => (
                <Link key={item.path} to={item.path}>
                    <button
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${location.pathname === item.path
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-gray-100'
                            }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d={item.icon}
                            />
                        </svg>
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                </Link>
            ))}

            <Link to="/profile">
                <button
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${location.pathname === '/profile'
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-gray-100'
                        }`}
                >
                    <img
                        src="/default-avatar.png"
                        alt="Perfil"
                        className="h-6 w-6 rounded-full mr-3 object-cover"
                    />
                    <span className="text-sm font-medium">Perfil</span>
                </button>
            </Link>
        </div>
    )
}

export default Sidebar 