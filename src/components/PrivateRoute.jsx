import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
    const { user } = useAuth()

    if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        return <Navigate to="/login" replace />
    }

    // Si hay usuario autenticado, renderizar el contenido protegido
    return children
} 