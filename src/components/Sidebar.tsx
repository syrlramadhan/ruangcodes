// components/Sidebar.tsx (yang sudah dimodifikasi)
import Link from 'next/link';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bookmark,
  BookOpen,
  FileText,
  Code,
  Database,
  Server,
  Terminal,
  X,
} from 'lucide-react';
import { JSX } from 'react';
import { useSidebar } from './SidebarContext';

interface SidebarProps {
  categories?: string[];
  currentCategory?: string;
}

const categoryIcons: Record<string, JSX.Element> = {
  Programming: <Code size={20} />,
  'Web Development': <Terminal size={20} />,
  Database: <Database size={20} />,
  DevOps: <Server size={20} />,
  Tutorial: <BookOpen size={20} />,
  Documentation: <FileText size={20} />,
  'Tips & Tricks': <Bookmark size={20} />,
  'Dasar pemrograman Go': <Code size={20} />,
  Artikel: <FileText size={20} />,
};

export default function Sidebar({
  categories = [],
  currentCategory,
}: SidebarProps) {
  const { isSidebarOpen, toggleSidebar, isMobile } = useSidebar();

  if (isMobile && !isSidebarOpen) {
    return null;
  }

  return (
    <>
      <aside
        className={`bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 fixed top-16 h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 z-40 backdrop-blur-sm ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } ${isMobile ? 'left-0' : 'left-0'}`}
      >
        <button
          onClick={toggleSidebar}
          className={`absolute -right-3 top-6 z-50 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-all duration-300 border border-blue-400 shadow-lg ${
            isSidebarOpen ? '' : 'rotate-180'
          }`}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <div className={`p-6 space-y-8 ${isSidebarOpen ? 'w-64' : 'w-16 mt-8'}`}>
          {/* Navigation */}
          <div>
            <h2
              className={`text-lg font-semibold text-white mb-4 flex items-center ${
                !isSidebarOpen && 'justify-center'
              }`}
            >
              <Menu size={isSidebarOpen ? 20 : 24} className={isSidebarOpen ? 'mr-3' : ''} />
              {isSidebarOpen && 'Navigasi'}
            </h2>
            <nav className="space-y-2">
              <Link
                href="/"
                className={`flex items-center px-3 py-3 text-gray-300 hover:bg-blue-600/20 rounded-xl transition-all duration-300 hover:text-white hover:border-l-4 hover:border-blue-400 ${
                  !isSidebarOpen && 'justify-center'
                }`}
                title={!isSidebarOpen ? 'Beranda' : undefined}
              >
                <Home size={20} />
                {isSidebarOpen && <span className="ml-3 font-medium">Beranda</span>}
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h2
              className={`text-lg font-semibold text-white mb-4 flex items-center ${
                !isSidebarOpen && 'justify-center'
              }`}
            >
              <BookOpen
                size={isSidebarOpen ? 20 : 24}
                className={isSidebarOpen ? 'mr-3' : ''}
              />
              {isSidebarOpen && 'Kategori'}
            </h2>
            <nav className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category}
                    href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 ${
                      currentCategory === category
                        ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                        : 'text-gray-300 hover:bg-blue-600/20 hover:text-white hover:border-l-4 hover:border-blue-400'
                    } ${!isSidebarOpen && 'justify-center'}`}
                    title={!isSidebarOpen ? category : undefined}
                  >
                    {categoryIcons[category] || <Bookmark size={20} />}
                    {isSidebarOpen && <span className="ml-3 font-medium">{category}</span>}
                  </Link>
                ))
              ) : (
                <div className={`flex ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <X size={20} className="text-gray-400" />
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>
      
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}