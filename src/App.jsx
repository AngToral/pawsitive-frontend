import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import PostDetailPage from './pages/PostDetailPage'
import CreatePostPage from './pages/CreatePost'
import SearchPage from './pages/SearchPage'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import MessagesPage from './pages/MessagesPage'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
