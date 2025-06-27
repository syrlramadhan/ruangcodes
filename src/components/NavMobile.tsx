import {
    Home,
    Info,
    BookOpen,
    Github,
    Instagram,
    Facebook,
    X,
    Code,
    Bookmark,
    Terminal,
    Database,
    Server,
    FileText
} from 'lucide-react';
import { JSX } from 'react';
import Link from 'next/link';
import { useSidebar } from './SidebarContext';

const categoryIcons: Record<string, JSX.Element> = {
    Programming: <Code size={20} className='mr-3' />,
    'Web Development': <Terminal size={20} className='mr-3' />,
    Database: <Database size={20} className='mr-3' />,
    DevOps: <Server size={20} className='mr-3' />,
    Tutorial: <BookOpen size={20} className='mr-3' />,
    Documentation: <FileText size={20} className='mr-3' />,
    'Tips & Tricks': <Bookmark size={20} className='mr-3' />,
    'Dasar pemrograman Go': <Code size={20} className='mr-3' />,
    Artikel: <FileText size={20} className='mr-3' />,
};

export default function NavMobile({ categories, currentCategory }: {
    categories: string[];
    currentCategory?: string;
}) {
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    if (!isSidebarOpen) return null;

    return (
        <div className="fixed inset-0 z-40 md:hidden">
            {/* Transparent overlay with blur effect */}
            <div
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
                onClick={toggleSidebar}
            />

            {/* Full-screen transparent content */}
            <div className="fixed inset-0 bg-gray-900 bg-opacity-90 p-6 flex flex-col">
                {/* Close Button - Top right */}
                <div className="flex justify-end">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-300 hover:text-white p-2"
                        aria-label="Close menu"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Main Content - Centered */}
                <div className="flex-1 flex flex-col justify-center items-center">
                    {/* Main Navigation */}
                    <div className="w-full max-w-md mb-12">
                        <nav className="space-y-4">
                            <Link
                                href="/"
                                className="flex items-center justify-center px-6 py-4 text-gray-100 hover:bg-gray-800 rounded-lg transition-colors text-xl"
                                onClick={toggleSidebar}
                            >
                                <Home size={24} className="mr-4" />
                                <span>Beranda</span>
                            </Link>
                            <Link
                                href="/tentang"
                                className="flex items-center justify-center px-6 py-4 text-gray-100 hover:bg-gray-800 rounded-lg transition-colors text-xl"
                                onClick={toggleSidebar}
                            >
                                <Info size={24} className="mr-4" />
                                <span>Tentang Kami</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Categories */}
                    <div className="w-full max-w-md mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                            Kategori
                        </h2>
                        <nav className="grid grid-cols-1 gap-3">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <Link
                                        key={category}
                                        href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                        className={`flex items-center justify-center px-6 py-4 rounded-lg transition-colors text-lg ${currentCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-100 hover:bg-gray-800'
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
                </div>

                {/* Social Media - Bottom center */}
                <div className="py-6 flex flex-col items-center">
                    <h3 className="text-xl text-white mb-4">Ikuti Kami</h3>
                    <div className="flex space-x-6">
                        <Link
                            href="https://github.com/syrlramadhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors duration-300 p-3"
                            aria-label="GitHub"
                        >
                            <Github size={28} />
                        </Link>
                        <Link
                            href="https://instagram.com/ruangcodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-pink-500 transition-colors duration-300 p-3"
                            aria-label="Instagram"
                        >
                            <Instagram size={28} />
                        </Link>
                        <Link
                            href="https://facebook.com/ruangcodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-blue-500 transition-colors duration-300 p-3"
                            aria-label="Facebook"
                        >
                            <Facebook size={28} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}