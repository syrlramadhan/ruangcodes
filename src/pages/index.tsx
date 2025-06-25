import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';

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

    const title = document.getDocumentTitle() || file.replace('.adoc', '').replace(/-/g, ' ');
    const category = document.getAttribute('category') || 'Uncategorized';
    const thumbnail = document.getAttribute('thumbnail') || '/images/default-thumbnail.png';
    const date = document.getAttribute('date') || '1970-01-01T00:00:00'; // fallback

    return {
      slug: file.replace('.adoc', ''),
      title,
      category,
      thumbnail,
      date,
    };
  })
  .sort((b, a) => new Date(b.date).getTime() - new Date(a.date).getTime()); // ↓ terbaru

  // Get all unique categories
  const categories = [...new Set(articles.map(article => article.category))];

  return {
    props: {
      articles,
      categories
    },
  };
}

export default function Home({
  articles,
  categories
}: {
  articles: { slug: string; title: string; category: string; thumbnail: string; date: string }[];
  categories: string[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isSidebarOpen } = useSidebar();

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>RuangCodes</title>
        <meta name="description" content="Modern IT learning articles with AsciiDoc and Next.js" />
      </Head>
      <Header />
      <div className="flex bg-gray-900 min-h-screen pt-16">
        <Sidebar categories={categories} />
        <main className={`flex-1 p-8 font-mono text-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'
          }`}>
          <h1 className="text-4xl font-bold mb-2">📚 Latest RuangCodes Articles</h1>
          <p className="text-lg text-gray-400 mb-8">
            Tutorials, guides, and documentation powered by RuangCodes.
          </p>
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(({ slug, title, thumbnail }) => (
              <Link key={slug} href={`/artikel/${slug}`} passHref>
                <div className="h-full flex flex-col p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer">

                  <div className="w-full aspect-[16/9] mb-4 overflow-hidden rounded-md bg-gray-700">
                    <img
                      src={thumbnail}
                      alt={title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <h2 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h2>

                  <div className="mt-auto pt-4">
                    <span className="inline-block px-3 py-1 text-xs bg-gray-700 rounded-full text-gray-300">
                      {articles.find(a => a.slug === slug)?.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </Link>

            ))}
          </section>
          <Footer />
        </main>
      </div>
    </>
  );
}