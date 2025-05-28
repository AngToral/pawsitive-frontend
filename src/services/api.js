const API_URL = import.meta.env.VITE_BACKEND;

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
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async logout() {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Posts
    async getPosts() {
        const response = await fetch(`${API_URL}/posts`, {
            credentials: 'include',
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

        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async likePost(postId) {
        const response = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Comments
    async getComments(postId) {
        const response = await fetch(`${API_URL}/comments/${postId}`, {
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async createComment(postId, text) {
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, text }),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Users
    async getUser(userId) {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            credentials: 'include',
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

        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            body: formData,
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Feed
    async getFeed() {
        const response = await fetch(`${API_URL}/feed`, {
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Notifications
    async getNotifications() {
        const response = await fetch(`${API_URL}/notifications`, {
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Messages
    async getConversations() {
        const response = await fetch(`${API_URL}/conversations`, {
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async getMessages(conversationId) {
        const response = await fetch(`${API_URL}/messages/${conversationId}`, {
            credentials: 'include',
        });
        return handleResponse(response);
    },

    async sendMessage(conversationId, text) {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, text }),
            credentials: 'include',
        });
        return handleResponse(response);
    },
} 