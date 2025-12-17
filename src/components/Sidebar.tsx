// components/Sidebar.tsx
import Link from 'next/link';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookOpen,
  FileText,
  Code,
  Database,
  Server,
  Terminal,
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

  // Don't render desktop sidebar on mobile - NavMobile handles mobile navigation
  if (isMobile) {
    return null;
  }

  return (
    <>
      <aside
        className={`sidebar-bg border-r border-[var(--border-primary)] fixed top-16 h-[calc(100vh-64px)] flex flex-col transition-all duration-300 z-40 shadow-[var(--shadow-sm)] ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } left-0`}
      >
        <div className={`space-y-6 flex-1 overflow-y-auto overflow-x-hidden ${isSidebarOpen ? 'p-4' : 'p-2 pt-4'}`}>
          {/* Navigation */}
          <div>
            {isSidebarOpen && (
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3">
                Navigasi
              </h2>
            )}
            <nav className="space-y-1">
              <Link
                href="/"
                className={`flex items-center py-2.5 text-[var(--text-secondary)] hover:bg-blue-600/20 rounded-lg transition-all duration-200 hover:text-[var(--text-primary)] ${
                  isSidebarOpen ? 'px-3' : 'px-0 justify-center'
                }`}
                title={!isSidebarOpen ? 'Beranda' : undefined}
              >
                <Home size={20} className="flex-shrink-0" />
                {isSidebarOpen && <span className="ml-3 font-medium">Beranda</span>}
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            {isSidebarOpen && (
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3">
                Kategori
              </h2>
            )}
            <nav className="space-y-1">
              {categories.length > 0 ? (
                categories.map((category) => {
                  const isActive = currentCategory?.toLowerCase() === category.toLowerCase();
                  return (
                    <Link
                      key={category}
                      href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-[var(--text-secondary)] hover:bg-blue-600/20 hover:text-[var(--text-primary)]'
                      } ${isSidebarOpen ? 'px-3' : 'px-0 justify-center'}`}
                      title={!isSidebarOpen ? category : undefined}
                    >
                      <span className="flex-shrink-0">
                        {categoryIcons[category] || <Bookmark size={20} />}
                      </span>
                      {isSidebarOpen && <span className="ml-3 font-medium truncate">{category}</span>}
                    </Link>
                  );
                })
              ) : (
                <div className={`flex items-center text-[var(--text-muted)] text-sm py-2.5 ${!isSidebarOpen ? 'justify-center' : 'px-3'}`}>
                  {isSidebarOpen ? 'Tidak ada kategori' : <Bookmark size={20} className="opacity-30" />}
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Toggle Button at Bottom */}
        <div className={`border-t border-[var(--border-primary)] ${isSidebarOpen ? 'p-3' : 'p-2'}`}>
          <button
            onClick={toggleSidebar}
            className={`flex items-center w-full py-2.5 text-[var(--text-secondary)] hover:bg-blue-600/20 rounded-lg transition-all duration-200 hover:text-[var(--text-primary)] ${
              isSidebarOpen ? 'px-3' : 'px-0 justify-center'
            }`}
            title={!isSidebarOpen ? 'Buka Sidebar' : undefined}
          >
            {isSidebarOpen ? <ChevronLeft size={20} className="flex-shrink-0" /> : <ChevronRight size={20} className="flex-shrink-0" />}
            {isSidebarOpen && <span className="ml-3 font-medium">Tutup Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}