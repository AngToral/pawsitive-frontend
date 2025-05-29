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

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const decoded = jwtDecode(token)
                // Verificar si el token ha expirado
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded)
                } else {
                    localStorage.removeItem('token')
                }
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
            const token = await api.login(email, password)
            localStorage.setItem('token', token)
            const decoded = jwtDecode(token)
            setUser(decoded)
            return true
        } catch (err) {
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
            localStorage.removeItem('token')
            setUser(null)
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