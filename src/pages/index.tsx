// pages/index.tsx (Homepage yang sudah dimodifikasi)
import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NavMobile from '@/components/NavMobile';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Search, ArrowRight, BookOpen, Code, Database, Server } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import Image from 'next/image';

const asciidoctor = Asciidoctor();

export async function getStaticProps() {
  const dirPath = path.join(process.cwd(), 'content');
  const files = fs.readdirSync(dirPath);

  const articles = files
    .filter((file) => file.endsWith('.adoc'))
    .map((file) => {
      const filePath = path.join(dirPath, file);
      const adocContent = fs.readFileSync(filePath, 'utf-8');
      const document = asciidoctor.load(adocContent);

      const title =
        document.getDocumentTitle() || file.replace('.adoc', '').replace(/-/g, ' ');
      const categories = (document.getAttribute('categories') || 'Uncategorized')
        .split(',')
        .map((cat: string) => cat.trim());
      const thumbnail =
        document.getAttribute('thumbnail') || '/images/default-thumbnail.png';
      const date = document.getAttribute('date') || '1970-01-01T00:00:00';
      const description = document.getAttribute('description') || '';

      return {
        slug: file.replace('.adoc', ''),
        title,
        categories,
        thumbnail,
        date,
        description,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get all unique categories
  const categories = [
    ...new Set(articles.flatMap((article) => article.categories)),
  ];

  return {
    props: {
      articles,
      categories,
    },
  };
}

export default function Home({
  articles,
  categories,
}: {
  articles: {
    slug: string;
    title: string;
    categories: string[];
    thumbnail: string;
    date: string;
    description: string;
  }[];
  categories: string[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const filteredArticles = articles
    .filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 9);

  const featuredArticles = articles.slice(0, 3);
  const recentArticles = articles.slice(0, 6);

  return (
    <>
      <Head>
        <title>RuangCodes - Blog & Tutorial Teknologi</title>
        <meta
          name="description"
          content="Blog teknologi modern berisi panduan, tutorial, dan dokumentasi programming terbaru"
        />
      </Head>
      
      <Header />
      
      <div className="flex bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar categories={categories} />
        </div>
        
        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={toggleSidebar}
            />
            <NavMobile categories={categories} />
          </>
        )}
        
        <main
          className={`flex-1 p-6 md:p-8 transition-all duration-300 ${
            isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-16'
          }`}
        >
          {/* Hero Section */}
          <section className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Ruang<span className="text-white">Codes</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Tempat berbagi pengetahuan tentang programming, teknologi, dan pengembangan software. 
              Mari belajar dan berkembang bersama!
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <input
                type="text"
                placeholder="Cari artikel atau tutorial..."
                className="w-full p-4 pl-12 bg-gray-800 border border-gray-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </section>

          {/* Featured Articles */}
          {searchQuery === '' && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <BookOpen className="mr-3 text-blue-400" />
                Artikel Unggulan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map((article, index) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} passHref>
                    <div className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer">
                      <div className="w-full aspect-video mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          width={400}
                          height={225}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {article.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Articles */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              {searchQuery ? 'Hasil Pencarian' : 'Artikel Terbaru'}
              <span className="ml-3 text-blue-400 text-lg">
                ({filteredArticles.length})
              </span>
            </h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  Tidak ada artikel yang ditemukan untuk "{searchQuery}"
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Tampilkan Semua Artikel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} passHref>
                    <div className="group bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:bg-gray-750 cursor-pointer">
                      <div className="w-full aspect-video mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-gray-700 to-gray-600">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={169}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {article.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                          Baca Selengkapnya →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Categories Overview */}
          {searchQuery === '' && (
            <section className="mt-16">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Code className="mr-3 text-blue-400" />
                Kategori Populer
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category}
                    href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer group"
                  >
                    <div className="text-blue-400 mb-3 group-hover:text-blue-300 transition-colors">
                      {category === 'Programming' && <Code size={32} className="mx-auto" />}
                      {category === 'Database' && <Database size={32} className="mx-auto" />}
                      {category === 'DevOps' && <Server size={32} className="mx-auto" />}
                      {!['Programming', 'Database', 'DevOps'].includes(category) && 
                       <BookOpen size={32} className="mx-auto" />}
                    </div>
                    <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                      {category}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Load More Button */}
          {searchQuery === '' && articles.length > 9 && (
            <div className="text-center mt-12">
              <Link href="/kategori/artikel" passHref>
                <button className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl mx-auto font-semibold text-lg">
                  Lihat Semua Artikel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            </div>
          )}

          <Footer />
        </main>
      </div>
    </>
  );
}