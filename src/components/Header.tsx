import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg">
      <h1 className="text-white text-2xl font-bold tracking-tight m-0 font-mono">
        RuangCodes
      </h1>
      <nav className="flex space-x-6">
        <Link 
          href="/" 
          className="text-gray-300 text-lg font-medium hover:text-blue-400 transition-colors duration-300 flex items-center gap-1 font-mono"
        >
          <span className="text-xl">🏠</span> Home
        </Link>
      </nav>
    </header>
  );
}