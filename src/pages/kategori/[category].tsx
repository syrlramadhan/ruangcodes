import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSidebar } from '@/components/SidebarContext';

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
      const category = doc.getAttribute('category') || 'Uncategorized';
      categories.add(category);
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
        const category = doc.getAttribute('category') || 'Uncategorized';
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');

        if (normalizedCategory === params.category) {
          return {
            slug: file.replace('.adoc', ''),
            title: doc.getDocumentTitle(),
            description: doc.getAttribute('description') || '',
            category,
            thumbnail: doc.getAttribute('thumbnail') || '/images/default-thumbnail.png',
            date: doc.getAttribute('date') || '1970-01-01T00:00:00', // tambahkan date
          };
        }
        return null;
      })
  );


  // Filter out null values
  const filteredArticles = articles
    .filter((article) => article !== null)
    .sort((b, a) => new Date(b.date).getTime() - new Date(a.date).getTime());


  // Get all categories for sidebar
  const allCategories = new Set<string>();
  files.forEach((file) => {
    if (file.endsWith('.adoc')) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const doc = asciidoctor.load(content, { safe: 'safe' });
      const category = doc.getAttribute('category') || 'Uncategorized';
      allCategories.add(category);
    }
  });

  return {
    props: {
      articles: filteredArticles,
      category: params.category.replace(/-/g, ' '),
      categories: Array.from(allCategories),
    },
  };
}

export default function CategoryPage({
  articles,
  category,
  categories,
}: {
  articles: { slug: string; title: string; description: string; category: string; thumbnail: string; date: string }[]
  category: string;
  categories: string[];
}) {
  const { isSidebarOpen } = useSidebar();

  return (
    <>
      <Head>
        <title>Artikel {category} | RuangCodes</title>
        <meta
          name="description"
          content={`Kumpulan artikel tentang ${category}`}
        />
      </Head>
      <Header />
      <div className="flex bg-gray-900 min-h-screen pt-16">
        <Sidebar categories={categories} currentCategory={category} />
        <main className={`flex-1 p-8 font-mono text-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'
          }`}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
              Artikel dalam Kategori: {category}
            </h1>
            {articles.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                <p className="text-gray-400">
                  Belum ada artikel dalam kategori ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/artikel/${article.slug}`}
                    className="h-full flex flex-col p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-full aspect-[16/9] mb-4 overflow-hidden rounded-md bg-gray-700">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    {article.description && (
                      <p className="text-gray-400 line-clamp-3 mb-4">
                        {article.description}
                      </p>
                    )}
                    <div className="mt-auto pt-2">
                      <span className="inline-block px-3 py-1 text-xs bg-gray-700 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </Link>

                ))}
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}