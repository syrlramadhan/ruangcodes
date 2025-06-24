import Link from 'next/link';
import { Github, Twitter, Linkedin, Youtube, Instagram, Facebook } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg">
      {/* Left side - Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">RC</span>
        </div>
        <h1 className="text-white text-2xl font-bold tracking-tight m-0 font-mono">
          RuangCodes
        </h1>
      </div>

      {/* Right side - Social Media */}
      <div className="flex items-center space-x-4">
        <Link 
          href="https://github.com/ruangcodes" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-300"
          aria-label="GitHub"
        >
          <Github size={24} />
        </Link>
        <Link 
          href="https://instagram.com/ruangcodes" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
          aria-label="Instagram"
        >
          <Instagram size={24} />
        </Link>
        <Link 
          href="https://linkedin.com/company/ruangcodes" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-blue-500 transition-colors duration-300"
          aria-label="LinkedIn"
        >
          <Linkedin size={24} />
        </Link>
        <Link 
          href="https://facebook.com/ruangcodes" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-red-500 transition-colors duration-300"
          aria-label="Facebook"
        >
          <Facebook size={24} />
        </Link>
      </div>
    </header>
  );
}