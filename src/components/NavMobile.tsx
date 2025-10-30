// components/NavMobile.tsx (yang sudah dimodifikasi)
import {
    Home,
    Info,
    Github,
    Instagram,
    Facebook,
    X,
    Code,
    Bookmark,
    Terminal,
    Database,
    Server,
    FileText,
    BookOpen,
} from 'lucide-react';
import { JSX } from 'react';
import Link from 'next/link';
import { useSidebar } from './SidebarContext';

const categoryIcons: Record<string, JSX.Element> = {
    Programming: <Code size={24} className='mr-4' />,
    'Web Development': <Terminal size={24} className='mr-4' />,
    Database: <Database size={24} className='mr-4' />,
    DevOps: <Server size={24} className='mr-4' />,
    Tutorial: <BookOpen size={24} className='mr-4' />,
    Documentation: <FileText size={24} className='mr-4' />,
    'Tips & Tricks': <Bookmark size={24} className='mr-4' />,
    'Dasar pemrograman Go': <Code size={24} className='mr-4' />,
    Artikel: <FileText size={24} className='mr-4' />,
};

export default function NavMobile({ categories, currentCategory }: {
    categories: string[];
    currentCategory?: string;
}) {
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    if (!isSidebarOpen) return null;

    return (
        <div className="fixed inset-0 z-40 md:hidden">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
                onClick={toggleSidebar}
            />

            {/* Sidebar content */}
            <div className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-gray-800 to-gray-900 p-6 flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold text-white">RuangCodes</h1>
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 mb-8">
                    <Link
                        href="/"
                        className="flex items-center px-4 py-3 text-gray-100 hover:bg-blue-600 rounded-xl transition-colors text-lg font-medium"
                        onClick={toggleSidebar}
                    >
                        <Home size={24} className="mr-4" />
                        <span>Beranda</span>
                    </Link>
                    <Link
                        href="/tentang"
                        className="flex items-center px-4 py-3 text-gray-100 hover:bg-blue-600 rounded-xl transition-colors text-lg font-medium"
                        onClick={toggleSidebar}
                    >
                        <Info size={24} className="mr-4" />
                        <span>Tentang</span>
                    </Link>
                </nav>

                {/* Categories */}
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white mb-4">Kategori</h2>
                    <nav className="space-y-2">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <Link
                                    key={category}
                                    href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-colors text-lg ${
                                        currentCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-100 hover:bg-gray-700'
                                        }`}
                                    onClick={toggleSidebar}
                                >
                                    {categoryIcons[category] || <Bookmark size={24} className="mr-4" />}
                                    <span>{category}</span>
                                </Link>
                            ))
                        ) : (
                            <div className="text-gray-400 text-center py-4">
                                Tidak ada kategori tersedia
                            </div>
                        )}
                    </nav>
                </div>

                {/* Social Media */}
                <div className="pt-6 border-t border-gray-700">
                    <h3 className="text-lg text-white mb-4">Ikuti Kami</h3>
                    <div className="flex space-x-4">
                        <Link
                            href="https://github.com/syrlramadhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-300"
                            aria-label="GitHub"
                        >
                            <Github size={24} />
                        </Link>
                        <Link
                            href="https://instagram.com/ruangcodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center p-3 text-gray-300 hover:text-pink-400 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                            aria-label="Instagram"
                        >
                            <Instagram size={24} />
                        </Link>
                        <Link
                            href="https://facebook.com/ruangcodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center p-3 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors duration-300"
                            aria-label="Facebook"
                        >
                            <Facebook size={24} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}