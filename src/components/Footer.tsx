// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="text-center p-8 text-sm text-gray-400 mt-12 border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-300">
            © {new Date().getFullYear()} RuangCodes. Built with ❤️ by{' '}
            <Link href="https://github.com/syrlramadhan" className="text-blue-400 hover:text-blue-300 transition-colors">
              Syahrul Ramadhan
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="https://github.com/syrlramadhan"
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://instagram.com/ruangcodes"
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="https://facebook.com/ruangcodes"
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}