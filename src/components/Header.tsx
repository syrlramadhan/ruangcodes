// components/Header.tsx
import Link from 'next/link';
import { Menu, Github, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';
import { useSidebar } from './SidebarContext';

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-95">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <h1 className="text-white text-2xl font-bold tracking-tight m-0 font-sans">
            RUANG<span className="text-blue-300">CODES</span>
          </h1>
        </div>

        {/* Right side - Social Media + Hamburger Menu */}
        <div className="flex items-center space-x-4">
          {/* Social Media - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="https://github.com/syrlramadhan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-all duration-300 p-2 rounded-full hover:bg-blue-700"
              aria-label="GitHub"
            >
              <Github size={20} />
            </Link>
            <Link
              href="https://instagram.com/ruangcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-pink-400 transition-all duration-300 p-2 rounded-full hover:bg-blue-700"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="https://facebook.com/ruangcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition-all duration-300 p-2 rounded-full hover:bg-blue-700"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </Link>
          </div>

          {/* Hamburger Menu - Shown only on mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-300 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-blue-700"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>
    </>
  );
}