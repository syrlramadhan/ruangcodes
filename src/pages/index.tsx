import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
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

      return {
        slug: file.replace('.adoc', ''),
        title,
        categories,
        thumbnail,
        date,
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
  }[];
  categories: string[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isSidebarOpen } = useSidebar();

  const filteredArticles = articles
    .filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 6); // Batasi ke 6 artikel terbaru

  return (
    <>
      <Head>
        <title>RuangCodes</title>
        <meta
          name="description"
          content="Panduan dan tutorial teknologi modern dengan AsciiDoc dan Next.js"
        />
      </Head>
      <Header />
      <div className="flex bg-gray-900 min-h-screen pt-16">
        <Sidebar categories={categories} />
        <main
          className={`flex-1 p-8 font-mono text-gray-100 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          <h1 className="text-4xl font-bold mb-2">
            📚 Artikel Terbaru RuangCodes
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Panduan, tutorial, dan dokumentasi dari RuangCodes.
          </p>
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Cari artikel..."
              className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(({ slug, title, thumbnail, categories }) => (
              <Link key={slug} href={`/artikel/${slug}`} passHref>
                <div className="h-full flex flex-col p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                  <div className="w-full aspect-[16/9] mb-4 overflow-hidden rounded-md bg-gray-700">
                    <Image
                      src={thumbnail}
                      alt={title}
                      className="object-cover w-full h-full"
                      width={640}
                      height={360}
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                    {title}
                  </h2>
                  <div className="mt-auto pt-4 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-block px-3 py-1 text-xs bg-gray-700 rounded-full text-gray-300"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </section>
          <div className="mt-12 text-center">
            <Link href="/kategori/artikel" passHref>
              <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 text-sm font-semibold mx-auto">
                Artikel Lainnya
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </Link>
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}