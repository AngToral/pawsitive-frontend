import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { HiMagnifyingGlass, HiUser, HiPaperAirplane } from 'react-icons/hi2';
import { ThreeDots } from 'react-loader-spinner';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_BACKEND || 'http://localhost:3000';

export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Cargar conversaciones al montar
    useEffect(() => {
        loadConversations();
    }, []);

    // Cargar mensajes cuando se selecciona una conversación
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);
        }
    }, [selectedConversation]);

    // Scroll al último mensaje
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversations = async () => {
        try {
            setIsLoading(true);
            const data = await api.getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Error al cargar conversaciones:', err);
            setError('Error al cargar las conversaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            setIsLoading(true);
            const data = await api.getMessages(conversationId);
            setMessages(data.messages);
        } catch (err) {
            console.error('Error al cargar mensajes:', err);
            setError('Error al cargar los mensajes');
        } finally {
            setIsLoading(false);
        }
    };

    const searchMessages = async () => {
        if (!selectedConversation || !messageSearchTerm.trim()) return;

        try {
            setIsLoading(true);
            const results = await api.searchMessages(selectedConversation, messageSearchTerm.trim());
            setMessages(results.messages);
        } catch (err) {
            console.error('Error al buscar mensajes:', err);
            setError('Error al buscar mensajes');
        } finally {
            setIsLoading(false);
        }
    };

    // Búsqueda de usuarios
    const searchUsers = async (term) => {
        if (!term || term.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            console.log('Buscando usuarios con término:', term.trim());
            const results = await api.searchUsers(term.trim());
            setSearchResults(results);
        } catch (err) {
            console.error('Error al buscar usuarios:', err);
            setError('Error al buscar usuarios');
        }
    };

    // Iniciar nueva conversación
    const startConversation = async (userId) => {
        try {
            const conversation = await api.getOrCreateConversation(userId);
            setSelectedConversation(conversation._id);
            loadConversations(); // Recargar la lista de conversaciones
            setUserSearchTerm(''); // Limpiar la búsqueda
            setSearchResults([]); // Limpiar resultados
        } catch (err) {
            console.error('Error al iniciar conversación:', err);
            setError('Error al iniciar la conversación');
        }
    };

    // Efecto para búsqueda de mensajes con debounce
    useEffect(() => {
        if (!messageSearchTerm || !messageSearchTerm.trim()) {
            if (selectedConversation) {
                loadMessages(selectedConversation);
            }
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            searchMessages();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [messageSearchTerm]);

    // Efecto para búsqueda de usuarios con debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchUsers(userSearchTerm);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearchTerm]);

    // Función para resaltar el texto que coincide
    const highlightMatch = (text, searchTerm) => {
        if (!searchTerm) return text;
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ?
                        <span key={i} className="bg-yellow-100">{part}</span> :
                        part
                )}
            </span>
        );
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setIsLoading(true);
            const sentMessage = await api.sendMessage(selectedConversation, newMessage.trim());
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Error al enviar mensaje:', err);
            setError('Error al enviar el mensaje');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold">Mensajes</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Lista de conversaciones y buscador de usuarios */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 border-r border-gray-200 pr-4">
                        {/* Buscador de usuarios */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                placeholder="Buscar usuarios..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <HiMagnifyingGlass
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                            />
                        </div>

                        {/* Resultados de búsqueda de usuarios */}
                        {userSearchTerm && searchResults.length > 0 && (
                            <div className="mb-6 space-y-2">
                                {searchResults.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => startConversation(user._id)}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        {user.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.fullName}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    display: 'inline-block',
                                                    marginRight: '8px'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f3f4f6',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '8px'
                                            }}>
                                                <HiUser style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                                            </div>
                                        )}
                                        <div className="inline-block">
                                            <p className="font-medium">{highlightMatch(user.fullName, userSearchTerm)}</p>
                                            <p className="text-sm text-gray-500">@{highlightMatch(user.username, userSearchTerm)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Lista de conversaciones */}
                        <h2 className="text-lg font-medium mb-4">Conversaciones</h2>
                        {conversations.map(conv => (
                            <div
                                key={conv._id}
                                onClick={() => setSelectedConversation(conv._id)}
                                className={`p-3 rounded-lg cursor-pointer ${selectedConversation === conv._id
                                    ? 'bg-gray-600'
                                    : 'hover:bg-gray-700'
                                    }`}
                            >
                                <p className="font-medium">{conv.participants[0].username}</p>
                                <p className="text-sm truncate">
                                    {conv.lastMessage?.content || 'No hay mensajes'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Área de mensajes */}
                    <div className="col-span-2 flex flex-col h-[calc(100vh-200px)]">
                        {selectedConversation ? (
                            <>
                                {/* Buscador de mensajes */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        value={messageSearchTerm}
                                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                                        placeholder="Buscar en la conversación..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <HiMagnifyingGlass
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                    />
                                </div>

                                {/* Mensajes */}
                                <div className="flex-1 overflow-y-auto mb-4">
                                    {isLoading ? (
                                        <div className="flex justify-center">
                                            <ThreeDots color="#0EA5E9" height={50} width={50} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map(message => (
                                                <div
                                                    key={message._id}
                                                    className={`p-3 rounded-lg ${message.sender._id === user?._id
                                                        ? 'bg-pink-800 text-white ml-auto'
                                                        : 'bg-black'
                                                        } max-w-[70%]`}
                                                >
                                                    <p>{message.content}</p>
                                                    <p className="text-xs mt-1 opacity-70">
                                                        {new Date(message.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Campo de envío de mensajes */}
                                <form onSubmit={sendMessage} className="mt-auto">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Escribe un mensaje..."
                                            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || isLoading}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                                        >
                                            <HiPaperAirplane className="w-6 h-6 rotate-90" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Selecciona una conversación para ver los mensajes
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
} 