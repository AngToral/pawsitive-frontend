import { useState } from 'react'
import { api } from '../services/api'
import { ThreeDots } from 'react-loader-spinner'
import { Link } from 'react-router-dom'
import { HiHeart, HiOutlineHeart, HiShare, HiUser } from 'react-icons/hi2'
import ShareModal from './ShareModal'

function Post({ post }) {
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [comment, setComment] = useState('')
    const [comments, setComments] = useState(post.comments)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)

    const handleLike = async () => {
        if (isLiking) return
        setIsLiking(true)
        try {
            await api.likePost(post._id)
            setIsLiked(!isLiked)
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
        } catch (error) {
            console.error('Error al dar like:', error)
        } finally {
            setIsLiking(false)
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

    const handleShare = () => {
        setIsShareModalOpen(true)
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Cabecera del post */}
                <div className="flex items-center p-4">
                    <Link to={`/profile/${post.user._id}`} className="flex items-center">
                        {post.user.profilePicture ? (
                            <img
                                src={post.user.profilePicture}
                                alt={post.user.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <HiUser className="w-4 h-4 text-gray-500" />
                            </div>
                        )}
                        <span className="font-bold ml-2">{post.user.name}</span>
                    </Link>
                </div>

                {/* Imagen del post */}
                <Link to={`/post/${post._id}`}>
                    <img
                        src={post.image}
                        alt={post.caption}
                        className="w-full aspect-square object-cover"
                    />
                </Link>

                {/* Acciones del post */}
                <div className="flex justify-between p-4">
                    <div className="flex gap-2">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`btn btn-ghost ${isLiked ? 'text-red-500' : ''} ${isLiking ? 'opacity-50' : ''}`}
                        >
                            {isLiking ? (
                                <ThreeDots color="#0EA5E9" height={24} width={24} />
                            ) : isLiked ? (
                                <HiHeart className="w-6 h-6" />
                            ) : (
                                <HiOutlineHeart className="w-6 h-6" />
                            )}
                        </button>
                        <button
                            onClick={handleShare}
                            className="btn btn-ghost"
                        >
                            <HiShare className="w-6 h-6" />
                        </button>
                        <button className="btn btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                        <Link to={`/profile/${post.user._id}`} className="font-bold mr-2">
                            {post.user.name}
                        </Link>
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
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Añade un comentario..."
                            className="flex-1 outline-none"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={!comment.trim() || isSubmitting}
                            className={`text-primary-500 font-semibold ${!comment.trim() || isSubmitting ? 'opacity-50' : 'hover:text-primary-600'
                                }`}
                        >
                            {isSubmitting ? (
                                <ThreeDots color="#ffffff" height={24} width={24} />
                            ) : (
                                'Publicar'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de compartir */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                post={post}
            />
        </>
    )
}

export default Post 