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
      return {
        slug: file.replace('.adoc', ''),
        title,
        category
      };
    });

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
  articles: { slug: string; title: string; category: string }[];
  categories: string[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

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
        <main className="flex-1 p-8 font-mono text-gray-100 ml-64">
          <h1 className="text-4xl font-bold mb-2">📚 Latest RungaCodes Articles</h1>
          <p className="text-lg text-gray-400 mb-8">
            Tutorials, guides, and documentation powered by AsciiDoc.
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
            {filteredArticles.map(({ slug, title }) => (
              <Link key={slug} href={`/artikel/${slug}`} passHref>
                <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                  <h2 className="text-xl font-semibold mb-2">{title}</h2>
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