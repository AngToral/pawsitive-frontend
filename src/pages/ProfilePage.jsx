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
    // Estados para el sistema de seguimiento
    const [isFollowing, setIsFollowing] = useState(false)
    const [isLoadingFollow, setIsLoadingFollow] = useState(false)
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
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
                    console.log('Datos de usuario obtenidos:', {
                        ...userData,
                        followersCount: userData.followersCount
                    });
                    setProfileUser(userData);

                    // Obtener datos de seguimiento después de tener los datos del usuario
                    try {
                        const userStats = await api.getUserStats(userId);
                        console.log('Estadísticas recibidas para otro usuario:', {
                            userId,
                            stats: userStats,
                            followersCount: userData.followersCount,
                            followingCount: userData.followingCount
                        });

                        // Si hay al menos un seguidor, asumimos que somos nosotros
                        // ya que el backend nos está devolviendo followersCount = 1
                        const isCurrentlyFollowing = userData.followersCount > 0;
                        console.log('Estado de seguimiento calculado:', {
                            followersCount: userData.followersCount,
                            isCurrentlyFollowing
                        });

                        setIsFollowing(isCurrentlyFollowing);
                        setFollowStats(userStats);
                    } catch (err) {
                        console.error('Error al obtener estadísticas:', err);
                        // Si hay error, usar los contadores del objeto de usuario
                        const fallbackStats = {
                            followers: userData.followersCount || 0,
                            following: userData.followingCount || 0
                        };
                        setFollowStats(fallbackStats);
                        // También establecemos el estado de seguimiento aquí
                        setIsFollowing(userData.followersCount > 0);
                    }
                } else {
                    console.log('Usando datos del usuario actual:', currentUser);
                    setProfileUser(currentUser);

                    // Obtener estadísticas del usuario actual
                    try {
                        const userStats = await api.getUserStats(currentUser._id);
                        console.log('Estadísticas recibidas para usuario actual:', {
                            userId: currentUser._id,
                            stats: userStats,
                            followersCount: currentUser.followersCount,
                            followingCount: currentUser.followingCount
                        });
                        setFollowStats(userStats);
                    } catch (err) {
                        console.error('Error al obtener estadísticas propias:', err);
                        const fallbackStats = {
                            followers: currentUser.followersCount || 0,
                            following: currentUser.followingCount || 0
                        };
                        setFollowStats(fallbackStats);
                    }
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

    const handleFollowToggle = async () => {
        if (isLoadingFollow) return;

        setIsLoadingFollow(true);
        try {
            if (isFollowing) {
                // Dejar de seguir al usuario
                await api.unfollowUser(userId);
                setIsFollowing(false);
                // Actualizar el contador de seguidores
                setFollowStats(prev => ({
                    ...prev,
                    followers: Math.max(0, prev.followers - 1) // Aseguramos que no sea negativo
                }));

                // Actualizar el estado del usuario del perfil
                setProfileUser(prev => ({
                    ...prev,
                    followersCount: Math.max(0, prev.followersCount - 1),
                    isFollowedByCurrentUser: false
                }));
            } else {
                // Seguir al usuario
                await api.followUser(userId);
                setIsFollowing(true);
                // Actualizar el contador de seguidores
                setFollowStats(prev => ({
                    ...prev,
                    followers: prev.followers + 1
                }));

                // Actualizar el estado del usuario del perfil
                setProfileUser(prev => ({
                    ...prev,
                    followersCount: (prev.followersCount || 0) + 1,
                    isFollowedByCurrentUser: true
                }));
            }
        } catch (error) {
            console.error('Error al cambiar estado de seguimiento:', error);
            // Mostrar el error en la UI
            setError('Error al cambiar estado de seguimiento');
        } finally {
            setIsLoadingFollow(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ThreeDots color="#0EA5E9" height={50} width={50} />
            </div>
        )
    }

    if (!profileUser) return null

    return (
        <div className="min-h-screen">
            {/* Header del perfil */}
            <div className="w-full max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
                    {/* Foto de perfil */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                        {profileUser?.profilePicture && (
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
                                className='shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out'
                            />
                        )}
                    </div>

                    {/* Información del perfil */}
                    <div className="flex-1 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-4">
                            <div className="flex flex-col space-x-4">
                                <h1 className="text-2xl font-bold">{profileUser.fullName}</h1>
                                <p>{profileUser.username}</p>
                            </div>
                            {userId && userId !== currentUser._id ? (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={isLoadingFollow}
                                    className={`px-4 py-2 rounded-lg font-medium ${isFollowing
                                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                        } disabled:opacity-50`}
                                >
                                    {isLoadingFollow ? (
                                        <ThreeDots color={isFollowing ? "#4B5563" : "#ffffff"} height={24} width={24} />
                                    ) : (
                                        <>
                                            {console.log('Estado actual del botón:', { isFollowing })}
                                            {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                                        </>
                                    )}
                                </button>
                            ) : !userId && (
                                <button className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-500">
                                    <HiPencil className="w-4 h-4" />
                                    <span>Editar perfil</span>
                                </button>
                            )}
                        </div>

                        <div className="flex justify-center sm:justify-start space-x-8 mb-4">
                            <div>
                                <span className="font-bold">{posts.length}</span>
                                <span className="text-gray-500 ml-1">publicaciones</span>
                            </div>
                            <div>
                                <span className="font-bold">{followStats.followers}</span>
                                <span className="text-gray-500 ml-1">seguidores</span>
                            </div>
                            <div>
                                <span className="font-bold">{followStats.following}</span>
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
                <div className="w-full max-w-4xl mx-auto px-4 py-8">
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
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            maxWidth: '1200px',
                            margin: '0 auto',
                        }}>
                            {posts.map((post) => (
                                <div
                                    key={post._id}
                                    style={{
                                        aspectRatio: '1/1',
                                        width: '30%',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    <img
                                        src={post.images[0].url || post.images[0]}
                                        alt={post.caption || `Post de ${profileUser.fullName}`}
                                        className='w-full h-full object-cover'
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
        </div >
    )
}