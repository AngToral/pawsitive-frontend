import { useEffect, useState } from 'react'
import { api } from '../services/api'
import Post from '../components/Post'

function Home() {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.getPosts()
                setPosts(data)
            } catch (err) {
                setError('Error al cargar los posts')
                console.error('Error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPosts()
    }, [])

    const handlePostUpdate = (updatedPost) => {
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post._id === updatedPost._id ? updatedPost : post
            )
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-6">
            {posts.map(post => (
                <Post
                    key={post._id}
                    post={post}
                    onPostUpdate={handlePostUpdate}
                />
            ))}
        </div>
    )
}

export default Home 