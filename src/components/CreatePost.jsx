import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { HiPhoto, HiUser } from 'react-icons/hi2'

export default function CreatePost({ onPostCreated }) {
    const [caption, setCaption] = useState('')
    const [images, setImages] = useState([])
    const [previewUrls, setPreviewUrls] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()
    const navigate = useNavigate()

    // Limpiar las URLs de vista previa cuando el componente se desmonte
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previewUrls])

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setImages(files)

        // Crear URLs de vista previa
        const urls = files.map(file => URL.createObjectURL(file))
        setPreviewUrls(urls)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await api.createPost({
                caption,
                images
            })

            // Limpiar el formulario
            setCaption('')
            setImages([])
            setPreviewUrls([])

            // Notificar al componente padre
            if (onPostCreated) {
                onPostCreated()
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleProfileClick = () => {
        navigate('/profile')
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex items-start space-x-4">
                    <div
                        onClick={handleProfileClick}
                        style={{ cursor: 'pointer' }}
                    >
                        {user?.profilePicture ? (
                            <img
                                src={`${user.profilePicture}?${new Date().getTime()}`}
                                alt={user?.fullName}
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <HiUser className="w-7 h-7 text-gray-500" />
                            </div>
                        )}
                    </div>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="¿Qué está haciendo tu mascota?"
                        className="flex-1 resize-none border rounded-lg p-4 h-32 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newImages = images.filter((_, i) => i !== index)
                                        const newUrls = previewUrls.filter((_, i) => i !== index)
                                        setImages(newImages)
                                        setPreviewUrls(newUrls)
                                        URL.revokeObjectURL(url)
                                    }}
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-lg">
                                <HiPhoto className="w-6 h-6" />
                                <span>Añadir fotos</span>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (!caption.trim() && images.length === 0)}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        ) : (
                            'Publicar'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
} 