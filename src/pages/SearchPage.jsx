import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { HiUser, HiMagnifyingGlass } from 'react-icons/hi2'
import { ThreeDots } from 'react-loader-spinner'

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    // Función de búsqueda
    const searchUsers = async (term) => {
        // Limpiar resultados si el término está vacío o es muy corto
        if (!term || term.trim().length < 2) {
            setUsers([])
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            console.log('Realizando búsqueda con término:', term.trim());
            const results = await api.searchUsers(term.trim())
            console.log('Resultados recibidos:', {
                término: term.trim(),
                cantidad: results.length,
                usuarios: results.map(u => ({
                    username: u.username,
                    fullName: u.fullName,
                    matchTipo: u.username.toLowerCase().includes(term.toLowerCase()) ? 'username' : 'fullName'
                }))
            });

            // Ordenar resultados: primero los que coinciden con username, luego por fullName
            const sortedResults = results.sort((a, b) => {
                const aMatchesUsername = a.username.toLowerCase().includes(term.toLowerCase());
                const bMatchesUsername = b.username.toLowerCase().includes(term.toLowerCase());

                if (aMatchesUsername && !bMatchesUsername) return -1;
                if (!aMatchesUsername && bMatchesUsername) return 1;
                return 0;
            });

            setUsers(sortedResults)
        } catch (err) {
            console.error('Error al buscar:', err)
            setError('Error al buscar usuarios')
        } finally {
            setIsLoading(false)
        }
    }

    // Efecto para manejar la búsqueda con debounce
    useEffect(() => {
        // No buscar si el término es muy corto
        if (!searchTerm || searchTerm.trim().length < 2) {
            setUsers([])
            return
        }

        const delayDebounceFn = setTimeout(() => {
            searchUsers(searchTerm)
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    const handleInputChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)

        // Limpiar resultados si el campo está vacío
        if (!value.trim()) {
            setUsers([])
        }
    }

    // Función para resaltar el texto que coincide
    const highlightMatch = (text, searchTerm) => {
        if (!searchTerm) return text;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ?
                        <span key={i} className="bg-yellow-100">{part}</span> :
                        part
                )}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold">Buscar</h1>
                </div>
            </div>

            {/* Buscador */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder="Buscar usuarios por nombre o username..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Resultados */}
                <div className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center">
                            <ThreeDots color="#0EA5E9" height={50} width={50} />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-4">
                            {users.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.fullName}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <HiUser style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
                                        </div>
                                    )}
                                    <div className="ml-4">
                                        <h3 className="font-medium text-gray-900">{highlightMatch(user.fullName, searchTerm)}</h3>
                                        <p className="text-sm text-gray-500">@{highlightMatch(user.username, searchTerm)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm && !isLoading ? (
                        <div className="text-center text-gray-500 py-8">
                            No se encontraron usuarios
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
} 