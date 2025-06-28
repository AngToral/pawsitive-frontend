import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const { register, error } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        if (formData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres')
            return
        }

        if (formData.username.length < 3 || formData.username.length > 30) {
            alert('El nombre de usuario debe tener entre 3 y 30 caracteres')
            return
        }

        setIsLoading(true)
        const { confirmPassword: _, ...registerData } = formData
        const success = await register(registerData)
        if (success) {
            navigate('/login')
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-8 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 px-8">
                <div className='flex flex-col items-center'>
                    <img src="/Daisy.png" alt="logo-pawsitive" className='w-32 mb-4' />
                    <h1 className="text-4xl font-bold text-center text-primary-500">
                        Pawsitive
                    </h1>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-500">
                        Crea tu cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary-500 hover:text-primary-600"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Nombre de usuario
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Nombre de usuario"
                            />
                        </div>
                        <div>
                            <label htmlFor="fullName" className="sr-only">
                                Nombre completo
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Correo electrónico"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña (mínimo 6 caracteres)"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Confirmar contraseña"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            ) : (
                                'Registrarse'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 