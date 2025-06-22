import Link from 'next/link';
import { Home, Info, Mail } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 h-[calc(100vh-64px)] p-4 fixed top-16 left-0 overflow-y-auto border-r border-gray-700 transition-all duration-300">
      <nav>
        <ul className="list-none p-0 m-0 space-y-4 text-gray-300">
          <li>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-lg font-medium hover:text-blue-400 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors duration-200"
            >
              <Home className="h-5 w-5" /> Beranda
            </Link>
          </li>
          <li>
            <Link 
              href="/tentang" 
              className="flex items-center gap-2 text-lg font-medium hover:text-blue-400 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors duration-200"
            >
              <Info className="h-5 w-5" /> Tentang
            </Link>
          </li>
          <li>
            <Link 
              href="/kontak" 
              className="flex items-center gap-2 text-lg font-medium hover:text-blue-400 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors duration-200"
            >
              <Mail className="h-5 w-5" /> Kontak
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}