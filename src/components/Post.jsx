import { useState } from 'react'
import { api } from '../services/api'

function Post({ post }) {
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [comment, setComment] = useState('')
    const [comments, setComments] = useState(post.comments)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleLike = async () => {
        try {
            await api.likePost(post._id)
            setIsLiked(!isLiked)
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
        } catch (error) {
            console.error('Error al dar like:', error)
        }
    }

    const handleComment = async (e) => {
        e.preventDefault()
        if (!comment.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const newComment = await api.commentPost(post._id, comment)
            setComments(prev => [...prev, newComment])
            setComment('')
        } catch (error) {
            console.error('Error al comentar:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Cabecera del post */}
            <div className="flex items-center p-4">
                <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-bold ml-2">{post.user.name}</span>
            </div>

            {/* Imagen del post */}
            <img
                src={post.image}
                alt={post.caption}
                className="w-full aspect-square object-cover"
            />

            {/* Acciones del post */}
            <div className="flex justify-between p-4">
                <div className="flex gap-2">
                    <button
                        onClick={handleLike}
                        className={`btn btn-ghost ${isLiked ? 'text-red-500' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                    <button className="btn btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                    <button className="btn btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>
                <button className="btn btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>

            {/* Likes y caption */}
            <div className="px-4 pb-2">
                <p className="font-bold">{likesCount} me gusta</p>
                <p>
                    <span className="font-bold mr-2">{post.user.name}</span>
                    {post.caption}
                </p>
            </div>

            {/* Comentarios */}
            <div className="px-4 pb-4 space-y-1">
                {comments.map((comment, index) => (
                    <p key={comment._id || index}>
                        <span className="font-bold mr-2">{comment.user.name}</span>
                        {comment.text}
                    </p>
                ))}
            </div>

            {/* Input de comentarios */}
            <form onSubmit={handleComment} className="flex p-4 border-t border-gray-100">
                <input
                    type="text"
                    placeholder="Añade un comentario..."
                    className="flex-1 outline-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!comment.trim() || isSubmitting}
                    className={`text-primary-500 font-semibold ${!comment.trim() || isSubmitting ? 'opacity-50' : 'hover:text-primary-600'
                        }`}
                >
                    Publicar
                </button>
            </form>
        </div>
    )
}

export default Post 