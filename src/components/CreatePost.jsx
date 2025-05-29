import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function CreatePost({ onPostCreated }) {
    const [caption, setCaption] = useState('')
    const [images, setImages] = useState([])
    const [previewUrls, setPreviewUrls] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()

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

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex items-start space-x-3">
                    <img
                        src={user?.profilePicture || 'https://via.placeholder.com/40'}
                        alt={user?.fullName}
                        className="w-10 h-10 rounded-full"
                    />
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="¿Qué está haciendo tu mascota?"
                        className="flex-1 resize-none border rounded-lg p-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square">
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
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
                                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div className="flex items-center space-x-2 text-gray-600 hover:text-primary-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                <span>Fotos</span>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || (!caption.trim() && images.length === 0)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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