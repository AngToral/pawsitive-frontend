import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { HiUser } from 'react-icons/hi'

const API_URL = import.meta.env.VITE_BACKEND || 'http://localhost:3000'

export default function Home() {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const fetchPosts = async () => {
        try {
            const data = await api.getPosts()
            console.log('Posts recibidos:', data)
            console.log('Ejemplo de imágenes del primer post:', JSON.stringify(data[0]?.images, null, 2))
            setPosts(data)
        } catch (err) {
            console.error('Error al obtener posts:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {posts.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No hay publicaciones aún. ¡Sé el primero en compartir!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post._id} className="bg-white rounded-lg shadow">
                            <div className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div
                                        onClick={() => handleUserClick(post.user._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {post.user.profilePicture ? (
                                            <img
                                                src={`${post.user.profilePicture}?${new Date().getTime()}`}
                                                alt={post.user.fullName}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <HiUser className="w-6 h-6 text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3
                                            className="font-semibold cursor-pointer hover:underline"
                                            onClick={() => handleUserClick(post.user._id)}
                                        >
                                            {post.user.fullName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-3">{post.caption}</p>

                                {post.images && post.images.length > 0 && (
                                    <div className={`mt-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                        {post.images.map((image, index) => {
                                            const imageUrl = image.url;
                                            return (
                                                <img
                                                    key={index}
                                                    src={imageUrl}
                                                    alt={`Post image ${index + 1}`}
                                                    className="w-full object-cover rounded-lg"
                                                    style={{
                                                        height: post.images.length === 1 ? '256px' : '160px'
                                                    }}
                                                    onError={(e) => {
                                                        console.error('Error al cargar la imagen:', imageUrl);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mt-4 flex items-center space-x-4 text-gray-500">
                                    <button className="flex items-center space-x-2 hover:text-primary-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                        <span>{post.likes?.length || 0}</span>
                                    </button>

                                    <button className="flex items-center space-x-2 hover:text-primary-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                        </svg>
                                        <span>{post.comments?.length || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 