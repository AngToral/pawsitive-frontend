import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="md:pl-64 pb-20 md:pb-0 w-full">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
} 