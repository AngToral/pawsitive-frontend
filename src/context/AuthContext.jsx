import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider')
    }
    return context
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchUserData = async (userId) => {
        try {
            const userData = await api.getUser(userId)
            setUser(userData)
        } catch (err) {
            console.error('Error al obtener datos del usuario:', err)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            console.log('Token encontrado:', token ? 'Sí' : 'No');

            if (!token) {
                console.log('No hay token almacenado');
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode(token)
                console.log('Token decodificado:', decoded);

                if (!decoded._id) {
                    console.error('El token no contiene ID de usuario');
                    localStorage.removeItem('token');
                    setLoading(false);
                    return;
                }

                // Verificar si el token ha expirado
                if (decoded.exp && decoded.exp * 1000 > Date.now()) {
                    console.log('Token válido, obteniendo datos del usuario con ID:', decoded._id);
                    // Obtener la información completa del usuario
                    await fetchUserData(decoded._id)
                } else {
                    console.log('Token expirado');
                    localStorage.removeItem('token')
                }
            } catch (decodeError) {
                console.error('Error al decodificar el token:', decodeError);
                localStorage.removeItem('token');
            }
        } catch (err) {
            console.error('Error al verificar autenticación:', err)
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        setError(null)
        try {
            const response = await api.login(email, password)
            console.log('Respuesta del login:', response);

            if (!response || !response.token) {
                throw new Error('La respuesta del servidor no incluye el token');
            }

            localStorage.setItem('token', response.token)

            try {
                const decoded = jwtDecode(response.token)
                console.log('Token decodificado:', decoded);

                if (!decoded._id) {
                    throw new Error('El token no contiene el ID del usuario');
                }

                // Obtener los datos completos del usuario
                const userData = await api.getUser(decoded._id);
                console.log('Datos completos del usuario:', userData);
                setUser(userData);

                return true
            } catch (decodeError) {
                console.error('Error al decodificar el token:', decodeError);
                throw new Error('Error al procesar el token de autenticación');
            }
        } catch (err) {
            console.error('Error completo del login:', err);
            setError(err.message)
            return false
        }
    }

    const register = async (userData) => {
        setError(null)
        try {
            await api.register(userData)
            // No establecemos el usuario aquí porque necesitamos que inicie sesión
            return true
        } catch (err) {
            setError(err.message)
            return false
        }
    }

    const logout = async () => {
        try {
            // Limpiar todo el localStorage
            localStorage.clear()
            // Limpiar el estado del usuario
            setUser(null)
            // Forzar recarga de la página para limpiar cualquier caché
            window.location.reload()
            return true
        } catch (err) {
            setError(err.message)
            return false
        }
    }

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
} 