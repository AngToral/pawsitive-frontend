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
        const response = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(response);
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
        const formData = new FormData();
        if (postData.images) {
            postData.images.forEach(image => {
                formData.append('images', image);
            });
        }
        formData.append('caption', postData.caption);

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${API_URL}/post`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return handleResponse(response);
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
        const response = await fetch(`${API_URL}/user/${userId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
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