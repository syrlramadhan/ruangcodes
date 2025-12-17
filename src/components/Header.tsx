// components/Header.tsx
import Link from 'next/link';
import { Menu, Github, Instagram, Facebook, Sun, Moon } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useTheme } from './ThemeContext';

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="header-bg p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg backdrop-blur-sm">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <h1 className="text-header-primary text-2xl font-bold tracking-tight m-0 font-sans">
            RUANG<span className="text-blue-400">CODES</span>
          </h1>
        </div>

        {/* Right side - Theme Toggle + Social Media + Hamburger Menu */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="text-header-secondary hover:text-header-primary transition-all duration-300 p-2 rounded-full hover:bg-header-hover"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Social Media - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="https://github.com/syrlramadhan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-header-secondary hover:text-header-primary transition-all duration-300 p-2 rounded-full hover:bg-header-hover"
              aria-label="GitHub"
            >
              <Github size={20} />
            </Link>
            <Link
              href="https://instagram.com/ruangcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-header-secondary hover:text-pink-400 transition-all duration-300 p-2 rounded-full hover:bg-header-hover"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="https://facebook.com/ruangcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-header-secondary hover:text-blue-400 transition-all duration-300 p-2 rounded-full hover:bg-header-hover"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </Link>
          </div>

          {/* Hamburger Menu - Shown only on mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-header-secondary hover:text-header-primary transition-colors duration-300 p-2 rounded-lg hover:bg-header-hover"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>
    </>
  );
}