// components/NavMobile.tsx (yang sudah dimodifikasi)
import React, { JSX } from 'react';
import {
    Home,
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={toggleSidebar}
            />

            {/* Sidebar content */}
            <div className="fixed right-0 top-0 h-full w-72 p-5 flex flex-col shadow-xl border-l border-[var(--border-primary)]" style={{ background: 'var(--bg-secondary)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-lg font-bold text-[var(--text-primary)]">Menu</h1>
                    <button
                        onClick={toggleSidebar}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1 mb-6">
                    <Link
                        href="/"
                        className="flex items-center px-3 py-2.5 text-[var(--text-primary)] hover:bg-blue-600 rounded-lg transition-colors text-base font-medium"
                        onClick={toggleSidebar}
                    >
                        <Home size={20} className="mr-3" />
                        <span>Beranda</span>
                    </Link>
                </nav>

                {/* Categories */}
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Kategori</h2>
                    <nav className="space-y-1">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <Link
                                    key={category}
                                    href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm ${
                                        currentCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                        }`}
                                    onClick={toggleSidebar}
                                >
                                    <span className="mr-3 flex-shrink-0">{categoryIcons[category] ? React.cloneElement(categoryIcons[category], { size: 18, className: '' }) : <Bookmark size={18} />}</span>
                                    <span className="truncate">{category}</span>
                                </Link>
                            ))
                        ) : (
                            <div className="text-[var(--text-muted)] text-center py-4 text-sm">
                                Tidak ada kategori tersedia
                            </div>
                        )}
                    </nav>
                </div>

                {/* Social Media */}
                <div className="pt-4 border-t border-[var(--border-primary)]">
                    <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Ikuti Kami</h3>
                    <div className="flex justify-center space-x-3">
                        <Link
                            href="https://github.com/syrlramadhan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-300 flex items-center justify-center"
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </Link>
                        <Link
                            href="https://instagram.com/ruangcodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-[var(--text-secondary)] hover:text-pink-400 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-300 flex items-center justify-center"
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </Link>
                        <Link
                            href="https://facebook.com/ruangcodes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-[var(--text-secondary)] hover:text-blue-400 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors duration-300 flex items-center justify-center"
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}