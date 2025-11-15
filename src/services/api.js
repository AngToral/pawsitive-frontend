const API_URL = import.meta.env.VITE_BACKEND || 'http://localhost:3000';

// Función auxiliar para obtener las cabeceras
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Función auxiliar para manejar errores
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
};

export const api = {
    // Auth
    async login(email, password) {
        try {
            console.log('Intentando login con:', { email });

            const response = await fetch(`${API_URL}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || 'Error en el inicio de sesión');
                } catch {
                    throw new Error('Error en el inicio de sesión');
                }
            }

            // Intentar parsear la respuesta como JSON
            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);

            if (!responseData.token) {
                throw new Error('La respuesta del servidor no incluye el token');
            }

            const token = responseData.token;
            console.log('Token extraído:', token);

            if (!token) {
                throw new Error('El servidor devolvió un token vacío');
            }

            if (!token.startsWith('ey')) {
                throw new Error('El formato del token no es válido');
            }

            return {
                token,
                user: responseData.user
            };
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    async logout() {
        const response = await fetch(`${API_URL}/user/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Posts
    async getPosts() {
        try {
            const response = await fetch(`${API_URL}/post`, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Error al obtener los posts');
            }

            const data = await response.json();
            console.log('Respuesta del servidor (getPosts):', data);
            return data;
        } catch (error) {
            console.error('Error en getPosts:', error);
            throw error;
        }
    },

    async createPost(postData) {
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        console.log('req.user:', req.user);
        // Log de los datos que vamos a enviar
        console.log('Datos del post a enviar:', {
            caption: postData.caption,
            imagesCount: postData.images?.length,
            imageDetails: postData.images?.map(img => ({
                name: img.name,
                type: img.type,
                size: img.size
            }))
        });

        const formData = new FormData();
        if (postData.images) {
            postData.images.forEach((image, index) => {
                console.log(`Añadiendo imagen ${index}:`, {
                    name: image.name,
                    type: image.type,
                    size: image.size
                });
                formData.append('images', image);
            });
        }
        formData.append('caption', postData.caption);

        // Log del FormData
        console.log('Contenido del FormData:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        try {
            const response = await fetch(`${API_URL}/post`, {
                method: 'POST',
                headers,
                body: formData,
                credentials: 'include'
            });

            const contentType = response.headers.get('content-type');

            // Log de la respuesta del servidor
            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                contentType: contentType
            });

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) {
                    console.error('Error del servidor:', data);
                    throw new Error(data.message || 'Error al crear el post');
                }
                return data;
            } else {
                const text = await response.text();
                console.error('Respuesta no JSON del servidor:', text);
                throw new Error('Error del servidor: ' + text);
            }
        } catch (error) {
            console.error('Error completo:', error);
            throw error;
        }
    },

    async likePost(postId) {
        try {
            console.log('Intentando dar like al post:', postId);
            const response = await fetch(`${API_URL}/like/post/${postId}`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    postId: postId
                })
            });

            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.message || 'Error al modificar el like');
                } catch {
                    throw new Error(`Error del servidor: ${errorData}`);
                }
            }

            const data = await response.json();
            console.log('Like procesado correctamente. Datos recibidos:', {
                data,
                isLiked: data.isLiked,
                likes: data.likes,
                likesCount: data.likesCount
            });
            return {
                isLiked: data.isLiked || false,
                likes: data.likes || [],
                likesCount: data.likesCount || 0
            };
        } catch (error) {
            console.error('Error completo en likePost:', error);
            throw error;
        }
    },

    // Comments
    async getComments(postId) {
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    async createComment(postId, text) {
        try {
            console.log('Intentando crear comentario:', { postId, text });

            // Validación local
            if (!text || !text.trim()) {
                throw new Error('El texto del comentario es requerido');
            }

            const body = {
                text: text.trim()
            };

            console.log('Datos a enviar:', body);

            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.message || 'Error al crear comentario');
                } catch {
                    throw new Error(`Error del servidor: ${errorData}`);
                }
            }

            const data = await response.json();
            console.log('Comentario creado correctamente:', data);
            return data;
        } catch (error) {
            console.error('Error completo en createComment:', error);
            throw error;
        }
    },

    async deleteComment(postId, commentId) {
        try {
            console.log('Intentando eliminar comentario:', { postId, commentId });

            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include'
            });

            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error del servidor:', errorData);
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.message || 'Error al eliminar comentario');
                } catch {
                    throw new Error(`Error del servidor: ${errorData}`);
                }
            }

            const data = await response.json();
            console.log('Comentario eliminado correctamente:', data);
            return data;
        } catch (error) {
            console.error('Error completo en deleteComment:', error);
            throw error;
        }
    },

    // Users
    async getUser(userId) {
        try {
            if (!userId) {
                throw new Error('Se requiere un ID de usuario');
            }

            console.log('Obteniendo datos del usuario:', userId);

            const response = await fetch(`${API_URL}/user/${userId}`, {
                headers: getHeaders(),
            });

            console.log('Respuesta getUser:', {
                status: response.status,
                statusText: response.statusText
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener datos del usuario');
            }

            return data;
        } catch (error) {
            console.error('Error en getUser:', error);
            throw error;
        }
    },

    async updateProfile(userData) {
        const formData = new FormData();
        if (userData.avatar) {
            formData.append('avatar', userData.avatar);
        }
        Object.keys(userData).forEach(key => {
            if (key !== 'avatar') {
                formData.append(key, userData[key]);
            }
        });

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${API_URL}/user/update`, {
            method: 'PUT',
            headers,
            body: formData,
        });
        return handleResponse(response);
    },

    // Feed
    async getFeed() {
        const response = await fetch(`${API_URL}/feed`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // Notifications
    async getNotifications() {
        const response = await fetch(`${API_URL}/notification`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    async markNotificationsAsRead(notificationIds = null) {
        try {
            console.log('Marcando notificaciones como leídas:', { notificationIds });

            const response = await fetch(`${API_URL}/notification/read`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({
                    notificationIds: notificationIds ? Array.isArray(notificationIds) ? notificationIds : [notificationIds] : null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                throw new Error(errorData.message || 'Error al marcar notificaciones como leídas');
            }

            return response.json();
        } catch (error) {
            console.error('Error completo:', error);
            throw error;
        }
    },

    async deleteNotifications(notificationIds = null) {
        const response = await fetch(`${API_URL}/notification`, {
            method: 'DELETE',
            headers: getHeaders(),
            body: JSON.stringify({ notificationIds })
        });
        return handleResponse(response);
    },

    // Messages
    async getConversations() {
        const response = await fetch(`${API_URL}/chat`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    async getMessages(conversationId) {
        try {
            console.log('Obteniendo mensajes de la conversación:', conversationId);
            const response = await fetch(`${API_URL}/chat/${conversationId}/messages`, {
                method: 'GET',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al obtener mensajes:', errorData);
                throw new Error('Error al obtener los mensajes');
            }

            const data = await response.json();
            console.log('Mensajes obtenidos:', data);
            return data;
        } catch (error) {
            console.error('Error en getMessages:', error);
            throw error;
        }
    },

    async getOrCreateConversation(userId) {
        try {
            console.log('Intentando obtener o crear conversación con usuario:', userId);
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ participantId: userId }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al crear/obtener conversación:', errorData);
                throw new Error('Error al iniciar la conversación');
            }

            const data = await response.json();
            console.log('Conversación creada/obtenida:', data);
            return data;
        } catch (error) {
            console.error('Error en getOrCreateConversation:', error);
            throw error;
        }
    },

    async sendMessage(conversationId, text) {
        try {
            console.log('Enviando mensaje:', { conversationId, content: text });
            const response = await fetch(`${API_URL}/message/send`, {
                method: 'POST',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId,
                    content: text,
                    type: 'text'
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al enviar mensaje:', errorData);
                throw new Error('Error al enviar el mensaje');
            }

            const data = await response.json();
            console.log('Mensaje enviado:', data);
            return data;
        } catch (error) {
            console.error('Error en sendMessage:', error);
            throw error;
        }
    },

    async getUserPosts(userId) {
        try {
            if (!userId) {
                throw new Error('Se requiere un ID de usuario para obtener sus posts');
            }

            console.log('Intentando obtener posts del usuario con ID:', userId);
            const response = await fetch(`${API_URL}/post`, {
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error en la respuesta del servidor:', errorData);
                throw new Error('Error al obtener los posts del usuario');
            }

            const allPosts = await response.json();
            // Filtrar los posts por el usuario específico
            const userPosts = allPosts.filter(post => post.user._id === userId);

            console.log('Posts recibidos para el usuario:', {
                userId,
                totalPosts: allPosts.length,
                postsDelUsuario: userPosts.length,
                posts: userPosts.map(post => ({
                    id: post._id,
                    caption: post.caption,
                    userId: post.user._id
                }))
            });
            return userPosts;
        } catch (error) {
            console.error('Error en getUserPosts:', error);
            throw error;
        }
    },

    async getPost(postId) {
        try {
            console.log('Intentando obtener post con ID:', postId);
            const response = await fetch(`${API_URL}/post/${postId}`, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Respuesta del servidor:', errorData);
                throw new Error('Error al obtener el post');
            }

            const data = await response.json();
            console.log('Post obtenido correctamente:', data);
            return data;
        } catch (error) {
            console.error('Error en getPost:', error);
            throw error;
        }
    },

    async getOrderedPosts() {
        try {
            console.log('Obteniendo posts ordenados...');
            const response = await fetch(`${API_URL}/post`, {
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error en la respuesta del servidor:', errorData);
                throw new Error('Error al obtener los posts');
            }

            const data = await response.json();

            // Ordenar los posts: primero los más recientes
            const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return sortedPosts;
        } catch (error) {
            console.error('Error en getOrderedPosts:', error);
            throw error;
        }
    },

    async followUser(userId) {
        try {
            console.log('Intentando seguir al usuario:', userId);
            const response = await fetch(`${API_URL}/follow/${userId}`, {
                method: 'POST',
                headers: getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al seguir usuario:', errorData);
                throw new Error('Error al seguir al usuario');
            }

            const data = await response.json();
            console.log('Respuesta follow:', data);
            return data;
        } catch (error) {
            console.error('Error en followUser:', error);
            throw error;
        }
    },

    async unfollowUser(userId) {
        try {
            console.log('Intentando dejar de seguir al usuario:', userId);
            const response = await fetch(`${API_URL}/follow/${userId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al dejar de seguir usuario:', errorData);
                throw new Error('Error al dejar de seguir al usuario');
            }

            const data = await response.json();
            console.log('Respuesta unfollow:', data);
            return data;
        } catch (error) {
            console.error('Error en unfollowUser:', error);
            throw error;
        }
    },

    async getUserStats(userId) {
        try {
            console.log('Obteniendo estadísticas del usuario:', userId);
            const response = await fetch(`${API_URL}/user/${userId}`, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al obtener estadísticas:', errorData);
                throw new Error('Error al obtener estadísticas del usuario');
            }

            const userData = await response.json();
            console.log('Datos completos del usuario:', userData);

            const stats = {
                followers: userData.followersCount || 0,
                following: userData.followingCount || 0
            };

            console.log('Estadísticas calculadas:', stats);
            return stats;
        } catch (error) {
            console.error('Error en getUserStats:', error);
            return { followers: 0, following: 0 };
        }
    },

    async searchUsers(searchTerm) {
        try {
            console.log('Buscando usuarios con término:', searchTerm);
            const response = await fetch(`${API_URL}/user/search?username=${encodeURIComponent(searchTerm)}&fullName=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al buscar usuarios:', errorData);
                throw new Error('Error al buscar usuarios');
            }

            const data = await response.json();
            console.log('Respuesta de búsqueda:', {
                término: searchTerm,
                resultados: data.map(user => ({
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    matchType: user.username.toLowerCase().includes(searchTerm.toLowerCase()) ? 'username' : 'fullName'
                }))
            });

            // Filtrar los resultados localmente también para asegurar precisión
            const filteredData = data.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return filteredData;
        } catch (error) {
            console.error('Error en searchUsers:', error);
            throw error;
        }
    },

    async searchMessages(conversationId, searchTerm) {
        try {
            console.log('Buscando mensajes con término:', searchTerm, 'en conversación:', conversationId);
            const response = await fetch(`${API_URL}/message/${conversationId}/search?term=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error al buscar mensajes:', errorData);
                throw new Error('Error al buscar mensajes');
            }

            const data = await response.json();
            console.log('Respuesta de búsqueda de mensajes:', {
                término: searchTerm,
                conversación: conversationId,
                resultados: data.messages
            });
            return data.messages;
        } catch (error) {
            console.error('Error en searchMessages:', error);
            throw error;
        }
    },
} 