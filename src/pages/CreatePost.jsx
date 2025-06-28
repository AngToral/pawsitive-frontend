import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { HiPhoto, HiUser } from 'react-icons/hi2'
import { ThreeDots } from 'react-loader-spinner'

export default function CreatePostPage() {
    const [caption, setCaption] = useState('')
    const [images, setImages] = useState([])
    const [previewUrls, setPreviewUrls] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previewUrls])

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        console.log('Archivos seleccionados:', files.map(f => ({
            name: f.name,
            type: f.type,
            size: f.size
        })));

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setError('Solo se permiten imágenes en formato JPG, PNG o GIF');
            return;
        }

        setImages(files)
        const urls = files.map(file => URL.createObjectURL(file))
        setPreviewUrls(urls)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        // Validación del formulario
        if (!caption.trim()) {
            setError('Por favor, añade una descripción a tu publicación')
            return
        }

        setIsLoading(true)

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
            navigate('/')
        } catch (err) {
            setError(err.message || 'Ha ocurrido un error al crear el post')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full h-screen">
            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Crear publicación</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-start space-x-4 mb-6">
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
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="¿Qué está haciendo tu mascota?"
                            className="flex-1 resize-none border rounded-lg p-4 h-32 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {previewUrls.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            maxWidth: '400px',
                            margin: '0 auto'
                        }}>
                            {previewUrls.map((url, index) => (
                                <div key={index} style={{
                                    position: 'relative',
                                    width: '160px',
                                    height: '160px',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
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
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            border: 'none'
                                        }}
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
                            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium min-w-[120px] h-[40px] flex items-center justify-center"
                        >
                            {isLoading ? (
                                <ThreeDots
                                    height="24"
                                    width="24"
                                    radius="9"
                                    color="#ffffff"
                                    ariaLabel="loading"
                                />
                            ) : (
                                'Publicar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 