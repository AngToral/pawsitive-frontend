import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { HiUser, HiHeart, HiOutlineHeart, HiTrash, HiShare } from 'react-icons/hi2'
import { ThreeDots } from 'react-loader-spinner'
import { useAuth } from '../context/AuthContext'
import ShareModal from '../components/ShareModal'

export default function Home() {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedComments, setExpandedComments] = useState({})
    const [comments, setComments] = useState({})
    const [isSubmittingComment, setIsSubmittingComment] = useState({})
    const [isLiking, setIsLiking] = useState({})
    const [shareModalPost, setShareModalPost] = useState(null)
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            console.log('Obteniendo posts para el feed...');
            const postsData = await api.getOrderedPosts();
            console.log('Posts recibidos del servidor:', {
                cantidad: postsData.length,
                posts: postsData.map(post => ({
                    id: post._id,
                    userId: post.user._id,
                    userName: post.user.fullName,
                    fecha: post.createdAt
                }))
            });

            // Asegurarnos de que cada post tenga los likes inicializados correctamente
            const processedPosts = postsData.map(post => {
                const processedPost = {
                    ...post,
                    likes: Array.isArray(post.likes) ? post.likes : [],
                    likesCount: 0
                };

                // Solo establecer likesCount si hay likes
                if (Array.isArray(post.likes) && post.likes.length > 0) {
                    processedPost.likesCount = post.likes.length;
                }

                return processedPost;
            });

            console.log('Posts procesados:', {
                cantidad: processedPosts.length,
                ejemplo: processedPosts[0] ? {
                    id: processedPosts[0]._id,
                    usuario: processedPosts[0].user.fullName,
                    likes: processedPosts[0].likes.length
                } : 'No hay posts'
            });

            setPosts(processedPosts);
            // Inicializar estados para comentarios
            const commentsState = {};
            processedPosts.forEach(post => {
                commentsState[post._id] = '';
            });
            setComments(commentsState);
        } catch (err) {
            console.error('Error al obtener posts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`)
    }

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`)
    }

    const handleLike = async (postId) => {
        // Prevenir múltiples clicks mientras se procesa
        if (isLiking[postId]) return;

        // Encontrar el post actual
        const currentPost = posts.find(p => p._id === postId);
        if (!currentPost) return;

        setIsLiking(prev => ({ ...prev, [postId]: true }));

        // Determinar el nuevo estado
        const hasLiked = currentPost.likes?.includes(user._id);
        const updatedLikes = hasLiked
            ? (currentPost.likes || []).filter(id => id !== user._id)
            : [...(currentPost.likes || []), user._id];

        // Actualización optimista
        setPosts(prevPosts => prevPosts.map(post => {
            if (post._id === postId) {
                return {
                    ...post,
                    isLiked: !hasLiked,
                    likes: updatedLikes
                };
            }
            return post;
        }));

        try {
            await api.likePost(postId);
        } catch (error) {
            console.error('Error al dar like:', error);
            // Revertir en caso de error
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        isLiked: hasLiked,
                        likes: currentPost.likes
                    };
                }
                return post;
            }));
        } finally {
            setIsLiking(prev => ({ ...prev, [postId]: false }));
        }
    }

    const handleComment = async (e, postId) => {
        e.preventDefault()
        if (!comments[postId]?.trim() || isSubmittingComment[postId]) return

        setIsSubmittingComment(prev => ({ ...prev, [postId]: true }))
        try {
            console.log('Enviando comentario:', {
                postId,
                text: comments[postId],
                commentState: comments
            });

            const newComment = await api.createComment(postId, comments[postId].trim())

            console.log('Respuesta del servidor:', newComment);

            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...(post.comments || []), newComment]
                    }
                }
                return post
            }))
            setComments(prev => ({ ...prev, [postId]: '' }))
        } catch (error) {
            console.error('Error al comentar:', error)
        } finally {
            setIsSubmittingComment(prev => ({ ...prev, [postId]: false }))
        }
    }

    const handleDeleteComment = async (postId, commentId) => {
        try {
            await api.deleteComment(postId, commentId)
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(c => c._id !== commentId)
                    }
                }
                return post
            }))
        } catch (error) {
            console.error('Error al eliminar comentario:', error)
        }
    }

    const toggleComments = (postId) => {
        setExpandedComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }))
    }

    const handleShare = (post) => {
        setShareModalPost(post)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <ThreeDots color="#0EA5E9" height={50} width={50} />
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
                                {/* Cabecera del post */}
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

                                {/* Contenido del post */}
                                <p className="mt-3">{post.caption}</p>

                                {/* Imágenes */}
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
                                                    onClick={() => handlePostClick(post._id)}
                                                    onError={(e) => {
                                                        console.error('Error al cargar la imagen:', imageUrl);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex justify-between p-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            disabled={isLiking[post._id]}
                                            className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''} ${isLiking[post._id] ? 'opacity-50' : ''}`}
                                        >
                                            {isLiking[post._id] ? (
                                                <ThreeDots color="#0EA5E9" height={24} width={24} />
                                            ) : post.isLiked ? (
                                                <HiHeart className="w-6 h-6" />
                                            ) : (
                                                <HiOutlineHeart className="w-6 h-6" />
                                            )}
                                            <span>{post.likes?.length || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => toggleComments(post._id)}
                                            className="flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                            </svg>
                                            <span>{post.comments?.length || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare(post)}
                                            className="flex items-center gap-2"
                                        >
                                            <HiShare className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Likes y caption */}
                                <div className="px-4">
                                    <p className="font-bold">{post.likes?.length || 0} me gusta</p>
                                </div>

                                {/* Comentarios */}
                                {expandedComments[post._id] && (
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        {/* Lista de comentarios */}
                                        <div className="space-y-4 mb-4">
                                            {post.comments?.map((comment) => (
                                                <div key={comment._id} className="flex items-start gap-3">
                                                    <div
                                                        onClick={() => handleUserClick(comment.user._id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {comment.user?.profilePicture ? (
                                                            <img
                                                                src={comment.user.profilePicture}
                                                                alt={comment.user?.fullName}
                                                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
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
                                                    <div className="flex-1">
                                                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                                            <h4
                                                                onClick={() => handleUserClick(comment.user._id)}
                                                                className="font-semibold cursor-pointer hover:underline"
                                                            >
                                                                {comment.user?.fullName}
                                                            </h4>
                                                            <p>{comment.text}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {(user?._id === comment.user._id || user?._id === post.user._id) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(post._id, comment._id)}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <HiTrash className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Formulario de comentarios */}
                                        <form onSubmit={(e) => handleComment(e, post._id)} className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Escribe un comentario..."
                                                    value={comments[post._id] || ''}
                                                    onChange={(e) => setComments(prev => ({
                                                        ...prev,
                                                        [post._id]: e.target.value
                                                    }))}
                                                    disabled={isSubmittingComment[post._id]}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!comments[post._id]?.trim() || isSubmittingComment[post._id]}
                                                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmittingComment[post._id] ? (
                                                    <ThreeDots color="#ffffff" height={24} width={24} />
                                                ) : (
                                                    'Enviar'
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de compartir */}
            {shareModalPost && (
                <ShareModal
                    isOpen={true}
                    onClose={() => setShareModalPost(null)}
                    post={shareModalPost}
                />
            )}
        </div>
    )
} 