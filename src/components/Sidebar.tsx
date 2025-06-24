import Link from 'next/link';
import { 
  Home, 
  Info, 
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
  X
} from 'lucide-react';
import { JSX, useState, useEffect } from 'react';
import { useSidebar } from './SidebarContext';

interface SidebarProps {
  categories?: string[];
  currentCategory?: string;
}

const categoryIcons: Record<string, JSX.Element> = {
  'Programming': <Code size={20} />,
  'Web Development': <Terminal size={20} />,
  'Database': <Database size={20} />,
  'DevOps': <Server size={20} />,
  'Tutorial': <BookOpen size={20} />,
  'Documentation': <FileText size={20} />,
  'Tips & Tricks': <Bookmark size={20} />,
};

export default function Sidebar({ 
  categories = [], 
  currentCategory 
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        // Pindahkan logika ini ke SidebarProvider jika perlu
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`bg-gray-800 border-r border-gray-700 fixed top-16 h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 z-40
          ${isSidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute right-4 top-4 z-50 p-1 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700 transition-all duration-300 border border-gray-600 shadow-md`}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className={`p-4 space-y-6 ${isSidebarOpen ? 'w-64' : 'w-16 mt-4'}`}>
          {/* Categories Section */}
          <div>
            <h2 className={`text-lg font-semibold text-gray-100 mb-4 flex items-center ${!isSidebarOpen && 'justify-center'}`}>
              <BookOpen size={isSidebarOpen ? 20 : 24} className={isSidebarOpen ? 'mr-2' : ''} />
              {isSidebarOpen && 'Kategori'}
            </h2>
            <nav className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category}
                    href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center px-2 py-2 rounded transition-colors ${
                      currentCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    } ${!isSidebarOpen && 'justify-center'}`}
                    title={!isSidebarOpen ? category : undefined}
                  >
                    {categoryIcons[category] || <Bookmark size={isSidebarOpen ? 18 : 18} />}
                    {isSidebarOpen && (
                      <span className="ml-2">{category}</span>
                    )}
                  </Link>
                ))
              ) : (
                <div className={`flex ${!isSidebarOpen ? 'justify-center' : ''}`}>
                  <X size={isSidebarOpen ? 18 : 22} className="text-gray-400" />
                </div>
              )}
            </nav>
          </div>

          {/* Menu Section */}
          <div>
            <h2 className={`text-lg font-semibold text-gray-100 mb-4 flex items-center ${!isSidebarOpen && 'justify-center'}`}>
              <Menu size={isSidebarOpen ? 20 : 24} className={isSidebarOpen ? 'mr-2' : ''} />
              {isSidebarOpen && 'Menu'}
            </h2>
            <nav className="space-y-2">
              <Link
                href="/"
                className={`flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors ${!isSidebarOpen && 'justify-center'}`}
                title={!isSidebarOpen ? 'Beranda' : undefined}
              >
                <Home size={isSidebarOpen ? 18 : 18} />
                {isSidebarOpen && <span className="ml-2">Beranda</span>}
              </Link>
              <Link
                href="/tentang"
                className={`flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors ${!isSidebarOpen && 'justify-center'}`}
                title={!isSidebarOpen ? 'Tentang Kami' : undefined}
              >
                <Info size={isSidebarOpen ? 18 : 18} />
                {isSidebarOpen && <span className="ml-2">Tentang Kami</span>}
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}