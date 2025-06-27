import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import NavMobile from '@/components/NavMobile';
import Link from 'next/link';
import { useSidebar } from '@/components/SidebarContext';
import Image from 'next/image';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const asciidoctor = Asciidoctor();

export async function getStaticPaths() {
  const dirPath = path.join(process.cwd(), 'content');
  const files = fs.readdirSync(dirPath);

  // Get all unique categories
  const categories = new Set<string>();
  files.forEach((file) => {
    if (file.endsWith('.adoc')) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const doc = asciidoctor.load(content, { safe: 'safe' });
      const articleCategories =
        (doc.getAttribute('categories') || 'Uncategorized')
          .split(',')
          .map((cat: string) => cat.trim());
      articleCategories.forEach((cat: string) => categories.add(cat));
    }
  });

  return {
    paths: Array.from(categories).map((category) => ({
      params: {
        category: category.toLowerCase().replace(/\s+/g, '-'),
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({
  params,
}: {
  params: { category: string };
}) {
  const dirPath = path.join(process.cwd(), 'content');
  const files = fs.readdirSync(dirPath);

  // Get all articles in this category
  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith('.adoc'))
      .map(async (file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        const doc = asciidoctor.load(content, { safe: 'safe' });
        const categories = (doc.getAttribute('categories') || 'Uncategorized')
          .split(',')
          .map((cat: string) => cat.trim());
        const normalizedCategories = categories.map((cat: string) =>
          cat.toLowerCase().replace(/\s+/g, '-')
        );

        if (normalizedCategories.includes(params.category)) {
          return {
            slug: file.replace('.adoc', ''),
            title: doc.getDocumentTitle(),
            description: doc.getAttribute('description') || '',
            categories,
            thumbnail:
              doc.getAttribute('thumbnail') || '/images/default-thumbnail.png',
            date: doc.getAttribute('date') || '1970-01-01T00:00:00',
          };
        }
        return null;
      })
  );

  // Filter out null values and sort by date (newest first)
  const filteredArticles = articles
    .filter((article) => article !== null)
    .sort((b, a) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get all categories for sidebar
  const allCategories = new Set<string>();
  files.forEach((file) => {
    if (file.endsWith('.adoc')) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const doc = asciidoctor.load(content, { safe: 'safe' });
      const articleCategories = (doc.getAttribute('categories') || 'Uncategorized')
        .split(',')
        .map((cat: string) => cat.trim());
      articleCategories.forEach((cat: string) => allCategories.add(cat));
    }
  });

  return {
    props: {
      articles: filteredArticles,
      category: params.category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      categories: Array.from(allCategories),
    },
  };
}

export default function CategoryPage({
  articles,
  category,
  categories,
}: {
  articles: {
    slug: string;
    title: string;
    description: string;
    categories: string[];
    thumbnail: string;
    date: string;
  }[];
  category: string;
  categories: string[];
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Calculate pagination
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  // Page navigation
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <>
      <Head>
        <title>Artikel {category} | RuangCodes</title>
        <meta name="description" content={`Kumpulan artikel tentang ${category}`} />
      </Head>
      <Header />
      <div className="flex bg-gray-900 min-h-screen pt-16">
        <Sidebar categories={categories} currentCategory={category} />
        
        {/* Mobile Sidebar and Overlay */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={toggleSidebar}
            />
            <NavMobile categories={categories} currentCategory={category} />
          </>
        )}
        
        <main
          className={`flex-1 p-4 md:p-8 font-mono text-gray-100 transition-all duration-300 ${
            isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-16'
          }`}
        >
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-4 md:mb-6">
              <BookOpen size={24} className="mr-3 md:mr-5" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                {category}
              </h1>
            </div>

            {/* Articles Grid */}
            {articles.length === 0 ? (
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg border border-gray-700">
                <p className="text-gray-400">Belum ada artikel dalam kategori ini.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {paginatedArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/artikel/${article.slug}`}
                      className="h-full flex flex-col p-3 md:p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-full aspect-[16/9] mb-2 md:mb-4 overflow-hidden rounded-md bg-gray-700">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          className="object-cover w-full h-full"
                          width={640}
                          height={360}
                        />
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-sm md:text-xl font-semibold mb-1 md:mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      
                      {/* Description */}
                      {article.description && (
                        <p className="text-xs md:text-base text-gray-400 line-clamp-2 md:line-clamp-3 mb-2 md:mb-4">
                          {article.description}
                        </p>
                      )}
                      
                      {/* Categories */}
                      <div className="mt-auto pt-1 md:pt-2 flex flex-wrap gap-1 md:gap-2">
                        {article.categories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-block px-2 py-0.5 md:px-3 md:py-1 text-xs bg-gray-700 rounded-full text-gray-300"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg transition-colors duration-200 text-xs md:text-sm font-semibold ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
                      }`}
                    >
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Sebelumnya
                    </button>
                    
                    <span className="text-xs md:text-sm text-gray-300">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg transition-colors duration-200 text-xs md:text-sm font-semibold ${
                        currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
                      }`}
                    >
                      Selanjutnya
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                    </button>
                  </div>
                )}
              </>
            )}
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}