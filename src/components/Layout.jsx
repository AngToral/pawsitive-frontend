import Navbar from './Navbar'

export default function Layout({ children }) {
    return (
        <div className="flex">
            <Navbar />
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    )
} 