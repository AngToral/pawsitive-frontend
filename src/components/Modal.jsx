import { useEffect } from 'react'
import { HiXMark } from 'react-icons/hi2'

export default function Modal({ isOpen, onClose, children, title }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-white">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                        >
                            <span className="sr-only">Cerrar</span>
                            <HiXMark className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
} 