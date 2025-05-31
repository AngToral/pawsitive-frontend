import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import PostDetailPage from './pages/PostDetailPage'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
        <Route path="/profile/:userId" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
        <Route path="/post/:postId" element={<PrivateRoute><Layout><PostDetailPage /></Layout></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
