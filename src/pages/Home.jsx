import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Home() {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchPosts = async () => {
        try {
            const data = await api.getPosts()
            setPosts(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

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
                                    <img
                                        src={post.user.profilePicture || 'https://via.placeholder.com/40'}
                                        alt={post.user.fullName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{post.user.fullName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-3">{post.caption}</p>

                                {post.images && post.images.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {post.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Post image ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        ))}
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