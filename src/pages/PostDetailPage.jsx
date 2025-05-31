import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { HiUser, HiArrowLeft } from 'react-icons/hi2'
import { ThreeDots } from 'react-loader-spinner'

export default function PostDetailPage() {
    const { postId } = useParams()
    const [post, setPost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postData = await api.getPost(postId)
                setPost(postData)
            } catch (err) {
                setError('Error al cargar el post')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (postId) {
            fetchPost()
        }
    }, [postId])

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ThreeDots color="#0EA5E9" height={50} width={50} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        )
    }

    if (!post) return null

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div style={{
                borderBottom: '1px solid #e5e7eb',
                padding: '1rem',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <Link to="/profile">
                        <HiArrowLeft style={{ width: '24px', height: '24px' }} />
                    </Link>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Publicación</h1>
                </div>
            </div>

            {/* Contenido del Post */}
            <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
                {/* Información del usuario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div
                        onClick={() => post.user?._id && handleUserClick(post.user._id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {post.user?.profilePicture ? (
                            <img
                                src={post.user.profilePicture}
                                alt={post.user?.fullName}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <HiUser style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
                            </div>
                        )}
                    </div>
                    <span
                        onClick={() => post.user?._id && handleUserClick(post.user._id)}
                        style={{
                            fontWeight: '500',
                            cursor: 'pointer',
                            ':hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        {post.user?.fullName}
                    </span>
                </div>

                {/* Imágenes */}
                <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem'
                }}>
                    {post.images?.map((image, index) => (
                        <img
                            key={index}
                            src={image.url || image}
                            alt={`Imagen ${index + 1} del post`}
                            style={{
                                width: '100%',
                                maxHeight: '600px',
                                objectFit: 'cover',
                                marginBottom: index < post.images.length - 1 ? '4px' : '0'
                            }}
                        />
                    ))}
                </div>

                {/* Botones de interacción */}
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

                {/* Caption */}
                <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '1rem', marginTop: '1rem' }}>
                    {post.caption}
                </p>

                {/* Fecha */}
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {new Date(post.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>
        </div>
    )
} 