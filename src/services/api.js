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
        const response = await fetch(`${API_URL}/post`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
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
        const response = await fetch(`${API_URL}/like/${postId}`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // Comments
    async getComments(postId) {
        const response = await fetch(`${API_URL}/comment/${postId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    async createComment(postId, text) {
        const response = await fetch(`${API_URL}/comment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ postId, text }),
        });
        return handleResponse(response);
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
} 