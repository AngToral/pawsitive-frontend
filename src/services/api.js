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
            const response = await fetch(`${API_URL}/post/${postId}/like`, {
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
            console.log('Like procesado correctamente:', data);
            return data;
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
            headers: getHeaders(),
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
        const response = await fetch(`${API_URL}/message/${conversationId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    async sendMessage(conversationId, text) {
        const response = await fetch(`${API_URL}/message`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ conversationId, text }),
        });
        return handleResponse(response);
    },

    async getUserPosts(userId) {
        try {
            console.log('Intentando obtener posts del usuario con ID:', userId);
            const response = await fetch(`${API_URL}/post?userId=${userId}`, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Respuesta del servidor:', errorData);
                throw new Error('Error al obtener los posts del usuario');
            }

            const data = await response.json();
            console.log('Estructura de los posts recibidos:', data.map(post => ({
                id: post._id,
                caption: post.caption,
                imageStructure: post.images && post.images[0] ?
                    typeof post.images[0] === 'string' ?
                        'URL directa' :
                        Object.keys(post.images[0])
                    : 'No hay imágenes'
            })));
            return data;
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
} 