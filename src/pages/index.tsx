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
  const { isSidebarOpen } = useSidebar();

  const filteredArticles = articles
    .filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 9);

  const featuredArticles = articles.slice(0, 3);

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
      
      <div className="flex min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar categories={categories} />
        </div>
        
        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <NavMobile categories={categories} />
        )}
        
        <main
          className={`flex-1 px-4 py-6 md:p-8 transition-all duration-300 ${
            isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-16'
          }`}
        >
          {/* Hero Section */}
          <section className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-3 md:mb-4 leading-tight pb-1 md:pb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ruang</span>
              <span className="text-[var(--text-primary)]">Codes</span>
            </h1>
            <p className="text-base md:text-xl text-[var(--text-secondary)] mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              Tempat berbagi pengetahuan tentang programming, teknologi, dan pengembangan software. 
              Mari belajar dan berkembang bersama!
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8 md:mb-12">
              <input
                type="text"
                placeholder="Cari artikel atau tutorial..."
                className="w-full p-3 md:p-4 pl-10 md:pl-12 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-lg shadow-sm transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-[var(--text-muted)]" />
            </div>
          </section>

          {/* Featured Articles */}
          {searchQuery === '' && (
            <section className="mb-10 md:mb-16">
              <h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] mb-5 md:mb-8 flex items-center">
                <BookOpen className="mr-2 md:mr-3 text-blue-400 h-5 w-5 md:h-7 md:w-7" />
                Artikel Unggulan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map((article) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} passHref>
                    <div className="group h-full bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-primary)] hover:border-blue-500 transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer shadow-sm hover:shadow-lg">
                      <div className="w-full aspect-video overflow-hidden bg-[var(--bg-tertiary)]">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          width={400}
                          height={225}
                        />
                      </div>
                      <div className="p-3 md:p-5">
                        <div className="flex items-center justify-between gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            {article.categories.slice(0, 1).map((cat) => (
                              <span
                                key={cat}
                                className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-medium"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] md:text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-sm md:text-lg font-semibold text-[var(--text-primary)] mb-1 md:mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-xs md:text-sm line-clamp-2 hidden md:block">
                          {article.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Articles */}
          <section>
            <h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] mb-5 md:mb-8 flex items-center">
              {searchQuery ? 'Hasil Pencarian' : 'Artikel Terbaru'}
              <span className="ml-2 md:ml-3 text-blue-400 text-sm md:text-lg">
                ({filteredArticles.length})
              </span>
            </h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-[var(--text-tertiary)] text-base md:text-lg mb-4">
                  Tidak ada artikel yang ditemukan untuk &quot;{searchQuery}&quot;
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm md:text-base"
                >
                  Tampilkan Semua Artikel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredArticles.map((article) => (
                  <Link key={article.slug} href={`/artikel/${article.slug}`} passHref>
                    <div className="group h-full bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-primary)] hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                      <div className="w-full aspect-video overflow-hidden bg-[var(--bg-tertiary)]">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={169}
                        />
                      </div>
                      <div className="p-3 md:p-5">
                        <div className="flex items-center justify-between gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            {article.categories.slice(0, 1).map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 md:py-1 text-[10px] md:text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full font-medium"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                          <span className="text-[9px] md:text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-3 md:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <h3 className="text-sm md:text-base font-semibold text-[var(--text-primary)] mb-1 md:mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-xs md:text-sm line-clamp-2 mb-2 md:mb-4 hidden md:block">
                          {article.description}
                        </p>
                        <div className="pt-2 md:pt-3 border-t border-[var(--border-primary)]">
                          <span className="text-blue-400 text-xs md:text-sm font-medium group-hover:text-blue-300 transition-colors">
                            Baca Selengkapnya →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Categories Overview */}
          {searchQuery === '' && (
            <section className="mt-10 md:mt-16">
              <h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] mb-5 md:mb-8 flex items-center">
                <Code className="mr-2 md:mr-3 text-blue-400 h-5 w-5 md:h-7 md:w-7" />
                Kategori Populer
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category}
                    href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-[var(--bg-card)] rounded-xl p-4 md:p-6 text-center border border-[var(--border-primary)] hover:border-blue-500 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      {category === 'Programming' && <Code size={20} className="text-blue-400 md:hidden" />}
                      {category === 'Programming' && <Code size={24} className="text-blue-400 hidden md:block" />}
                      {category === 'Database' && <Database size={20} className="text-blue-400 md:hidden" />}
                      {category === 'Database' && <Database size={24} className="text-blue-400 hidden md:block" />}
                      {category === 'DevOps' && <Server size={20} className="text-blue-400 md:hidden" />}
                      {category === 'DevOps' && <Server size={24} className="text-blue-400 hidden md:block" />}
                      {!['Programming', 'Database', 'DevOps'].includes(category) && 
                       <BookOpen size={20} className="text-blue-400 md:hidden" />}
                      {!['Programming', 'Database', 'DevOps'].includes(category) && 
                       <BookOpen size={24} className="text-blue-400 hidden md:block" />}
                    </div>
                    <h3 className="text-[var(--text-primary)] font-semibold group-hover:text-blue-400 transition-colors text-xs md:text-base truncate">
                      {category}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Load More Button */}
          {searchQuery === '' && articles.length > 9 && (
            <div className="text-center mt-8 md:mt-12">
              <Link href="/kategori/artikel" passHref>
                <button className="flex items-center px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl md:rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl mx-auto font-semibold text-sm md:text-lg">
                  Lihat Semua Artikel
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
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