import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex gap-4 py-4">
                    <div className="w-64 hidden md:block">
                        <Sidebar />
                    </div>
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainLayout 