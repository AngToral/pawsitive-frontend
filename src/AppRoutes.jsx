import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePost';
import SearchPage from './pages/SearchPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
                <PrivateRoute>
                    <Layout>
                        <Home />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/profile" element={
                <PrivateRoute>
                    <Layout>
                        <ProfilePage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/profile/:userId" element={
                <PrivateRoute>
                    <Layout>
                        <ProfilePage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/post/:postId" element={
                <PrivateRoute>
                    <Layout>
                        <PostDetailPage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/create" element={
                <PrivateRoute>
                    <Layout>
                        <CreatePostPage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/search" element={
                <PrivateRoute>
                    <Layout>
                        <SearchPage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/messages" element={
                <PrivateRoute>
                    <Layout>
                        <MessagesPage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/notifications" element={
                <PrivateRoute>
                    <Layout>
                        <NotificationsPage />
                    </Layout>
                </PrivateRoute>
            } />
        </Routes>
    );
} 