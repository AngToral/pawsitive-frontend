import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { HiUser, HiArrowLeft, HiHeart, HiOutlineHeart, HiTrash } from 'react-icons/hi2'
import { ThreeDots } from 'react-loader-spinner'
import { useAuth } from '../context/AuthContext'

export default function PostDetailPage() {
    const { postId } = useParams()
    const [post, setPost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLiked, setIsLiked] = useState(false)
    const [comment, setComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postData = await api.getPost(postId)
                console.log('Post recibido:', postData);

                // Procesar el post para asegurar la consistencia de los likes
                const processedPost = {
                    ...postData,
                    likes: Array.isArray(postData.likes) ? postData.likes : [],
                    likesCount: 0
                };

                if (Array.isArray(postData.likes) && postData.likes.length > 0) {
                    processedPost.likesCount = postData.likes.length;
                }

                setPost(processedPost)
                setIsLiked(processedPost.likes.includes(user._id))
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
    }, [postId, user._id])

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`)
    }

    const handleLike = async () => {
        if (isLiking || !post) return;
        setIsLiking(true);

        // Determinar el nuevo estado
        const hasLiked = post.likes?.includes(user._id);
        const updatedLikes = hasLiked
            ? (post.likes || []).filter(id => id !== user._id)
            : [...(post.likes || []), user._id];

        // Actualización optimista
        setIsLiked(!hasLiked);
        setPost(prev => ({
            ...prev,
            isLiked: !hasLiked,
            likes: updatedLikes
        }));

        try {
            await api.likePost(postId);
        } catch (error) {
            console.error('Error al dar like:', error);
            // Revertir en caso de error
            setIsLiked(hasLiked);
            setPost(prev => ({
                ...prev,
                isLiked: hasLiked,
                likes: post.likes
            }));
        } finally {
            setIsLiking(false);
        }
    }

    const handleComment = async (e) => {
        e.preventDefault()
        if (!comment.trim() || isSubmittingComment) return

        setIsSubmittingComment(true)
        try {
            const newComment = await api.createComment(postId, comment)
            setPost(prev => ({
                ...prev,
                comments: [...(prev.comments || []), newComment]
            }))
            setComment('')
        } catch (error) {
            console.error('Error al comentar:', error)
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await api.deleteComment(postId, commentId)
            setPost(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c._id !== commentId)
            }))
        } catch (error) {
            console.error('Error al eliminar comentario:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <ThreeDots color="#0EA5E9" height={50} width={50} />
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

    if (!post) return null

    return (
        <div className="w-full">
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
                    <Link to="/">
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
                    <div>
                        <h2
                            onClick={() => post.user?._id && handleUserClick(post.user._id)}
                            style={{
                                fontWeight: '600',
                                cursor: 'pointer',
                                ':hover': { textDecoration: 'underline' }
                            }}
                        >
                            {post.user?.fullName}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {new Date(post.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
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
                                maxHeight: '500px',
                                objectFit: 'cover',
                                marginBottom: index < post.images.length - 1 ? '4px' : '0'
                            }}
                        />
                    ))}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''} ${isLiking ? 'opacity-50' : 'hover:text-red-500'}`}
                    >
                        {isLiking ? (
                            <ThreeDots color="#0EA5E9" height={24} width={24} />
                        ) : isLiked || (post.likes && post.likes.includes(user._id)) ? (
                            <HiHeart className="w-6 h-6" />
                        ) : (
                            <HiOutlineHeart className="w-6 h-6" />
                        )}
                        {(post.likes?.length > 0) && (
                            <span>{post.likes.length}</span>
                        )}
                    </button>
                </div>

                {/* Caption */}
                <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '1rem', marginTop: '1rem' }}>
                    {post.caption}
                </p>

                {/* Comentarios */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '1rem' }}>
                        Comentarios ({post.comments?.length || 0})
                    </h3>

                    {/* Lista de comentarios */}
                    <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {post.comments?.map((comment) => (
                            <div key={comment._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div
                                    onClick={() => handleUserClick(comment.user._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {comment.user?.profilePicture ? (
                                        <img
                                            src={comment.user.profilePicture}
                                            alt={comment.user?.fullName}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <HiUser style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        backgroundColor: '#000',
                                        borderRadius: '16px',
                                        padding: '0.5rem 1rem'
                                    }}>
                                        <h4
                                            onClick={() => handleUserClick(comment.user._id)}
                                            style={{
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                ':hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {comment.user?.fullName}
                                        </h4>
                                        <p>{comment.text}</p>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {(user?._id === comment.user._id || user?._id === post.user._id) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Formulario de comentarios */}
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Escribe un comentario..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isSubmittingComment}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!comment.trim() || isSubmittingComment}
                            style={{
                                padding: '0.5rem 1.5rem',
                                backgroundColor: '#0EA5E9',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: '500',
                                opacity: (!comment.trim() || isSubmittingComment) ? '0.5' : '1',
                                cursor: (!comment.trim() || isSubmittingComment) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmittingComment ? (
                                <ThreeDots color="#ffffff" height={24} width={24} />
                            ) : (
                                'Enviar'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
} 