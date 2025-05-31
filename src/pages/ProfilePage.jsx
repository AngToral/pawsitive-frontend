import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { HiUser, HiPencil } from 'react-icons/hi2'
import { ThreeDots } from 'react-loader-spinner'

export default function ProfilePage() {
    const { user: currentUser } = useAuth()
    const { userId } = useParams()
    const [profileUser, setProfileUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Si no hay userId en los parámetros, mostrar el perfil del usuario actual
                const targetUserId = userId || currentUser._id;
                console.log('Información de perfil:', {
                    urlUserId: userId,
                    currentUserId: currentUser._id,
                    targetUserId: targetUserId,
                    isOwnProfile: !userId || userId === currentUser._id
                });

                // Obtener datos del usuario
                if (userId && userId !== currentUser._id) {
                    const userData = await api.getUser(userId);
                    console.log('Datos de usuario obtenidos:', userData);
                    setProfileUser(userData);
                } else {
                    console.log('Usando datos del usuario actual:', currentUser);
                    setProfileUser(currentUser);
                }

                // Obtener posts del usuario
                console.log('Solicitando posts para:', targetUserId);
                const userPosts = await api.getUserPosts(targetUserId);
                console.log('Posts obtenidos:', {
                    cantidad: userPosts.length,
                    posts: userPosts.map(post => ({
                        id: post._id,
                        userId: post.user?._id,
                        images: post.images?.length
                    }))
                });
                setPosts(userPosts);
            } catch (err) {
                console.error('Error detallado al cargar perfil:', err);
                setError(err.message || 'Error al cargar el perfil');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [userId, currentUser]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ThreeDots color="#0EA5E9" height={50} width={50} />
            </div>
        )
    }

    if (!profileUser) return null

    return (
        <div className="min-h-screen bg-white">
            {/* Header del perfil */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-start space-x-8">
                    {/* Foto de perfil */}
                    <div className="flex-shrink-0">
                        {profileUser?.profilePicture ? (
                            <img
                                src={`${profileUser.profilePicture}?${new Date().getTime()}`}
                                alt={profileUser.fullName}
                                style={{
                                    width: '96px',
                                    height: '96px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #e5e7eb'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <HiUser style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
                            </div>
                        )}
                    </div>

                    {/* Información del perfil */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                            <h1 className="text-2xl font-bold">{profileUser.fullName}</h1>
                            {!userId && (
                                <button className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <HiPencil className="w-4 h-4" />
                                    <span>Editar perfil</span>
                                </button>
                            )}
                        </div>

                        <div className="flex space-x-8 mb-4">
                            <div>
                                <span className="font-bold">{posts.length}</span>
                                <span className="text-gray-500 ml-1">publicaciones</span>
                            </div>
                            <div>
                                <span className="font-bold">0</span>
                                <span className="text-gray-500 ml-1">seguidores</span>
                            </div>
                            <div>
                                <span className="font-bold">0</span>
                                <span className="text-gray-500 ml-1">seguidos</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm">{profileUser.bio || 'Sin biografía'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de posts */}
            <div className="border-t border-gray-200 mt-8">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {error && (
                        <div className="text-red-500 text-center py-4">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8">
                            Cargando publicaciones...
                        </div>
                    ) : posts.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            maxWidth: '1200px',
                            margin: '0 auto',
                        }}>
                            {posts.map((post) => (
                                <div
                                    key={post._id}
                                    style={{
                                        aspectRatio: '1/1',
                                        width: '100%',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    <img
                                        src={post.images[0].url || post.images[0]}
                                        alt={post.caption || `Post de ${profileUser.fullName}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            No hay publicaciones para mostrar.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}