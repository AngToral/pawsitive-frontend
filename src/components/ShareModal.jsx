import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HiUser, HiXMark } from 'react-icons/hi2';

function ShareModal({ isOpen, onClose, post }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (searchTerm.trim()) {
            const searchUsers = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const results = await api.searchUsers(searchTerm);
                    setUsers(results);
                } catch (err) {
                    setError('Error al buscar usuarios');
                    console.error('Error al buscar usuarios:', err);
                } finally {
                    setIsLoading(false);
                }
            };
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [searchTerm]);

    const handleShare = async () => {
        if (!selectedUser) return;

        setIsLoading(true);
        setError(null);
        try {
            // Obtener o crear la conversación con el usuario seleccionado
            const conversation = await api.getOrCreateConversation(selectedUser._id);

            // Crear el mensaje con el enlace al post
            const message = `¡Mira este post! http://localhost:5173/post/${post._id}`;

            // Enviar el mensaje
            await api.sendMessage(conversation._id, message);

            onClose();
        } catch (err) {
            setError('Error al compartir el post');
            console.error('Error al compartir:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 max-w-full">
                {/* Cabecera */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Compartir post</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                {/* Vista previa del post */}
                <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                        {post.user.profilePicture ? (
                            <img
                                src={post.user.profilePicture}
                                alt={post.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <HiUser className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">{post.user.name}</p>
                            <p className="text-sm text-gray-500 truncate">{post.caption}</p>
                        </div>
                    </div>
                </div>

                {/* Buscador de usuarios */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="w-full p-2 border rounded-lg mb-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Lista de usuarios */}
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <p className="text-center text-gray-500">Buscando usuarios...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg ${selectedUser?._id === user._id ? 'bg-gray-100' : ''
                                        }`}
                                >
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <HiUser className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}
                                    <span className="flex-1 text-left">{user.name}</span>
                                </button>
                            ))
                        ) : searchTerm ? (
                            <p className="text-center text-gray-500">No se encontraron usuarios</p>
                        ) : null}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="p-4 border-t flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={!selectedUser || isLoading}
                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${!selectedUser || isLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-600'
                            }`}
                    >
                        {isLoading ? 'Compartiendo...' : 'Compartir'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareModal;
