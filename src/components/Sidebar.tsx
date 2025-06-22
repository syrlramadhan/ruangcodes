// components/Sidebar.tsx
import Link from 'next/link';

interface SidebarProps {
  categories?: string[];
  currentCategory?: string;
}

export default function Sidebar({ 
  categories = [], 
  currentCategory 
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700 fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Kategori</h2>
          <nav className="space-y-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category}
                  href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`block px-3 py-2 rounded transition-colors ${
                    currentCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </Link>
              ))
            ) : (
              <p className="text-gray-400 px-3 py-2">Tidak ada kategori</p>
            )}
          </nav>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Menu</h2>
          <nav className="space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/tentang"
              className="block px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors"
            >
              Tentang Kami
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}