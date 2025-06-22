import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const asciidoctor = Asciidoctor();

export async function getStaticPaths() {
  const dirPath = path.join(process.cwd(), 'content');
  const files = fs.readdirSync(dirPath);

  const paths = files
    .filter((file) => file.endsWith('.adoc'))
    .map((file) => ({
      params: { slug: file.replace('.adoc', '') },
    }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'content', `${params.slug}.adoc`);
  const adocContent = fs.readFileSync(filePath, 'utf-8');

  // Load all articles with their categories
  const allFiles = fs.readdirSync(path.join(process.cwd(), 'content'));
  const allArticles = await Promise.all(
    allFiles
      .filter((file) => file.endsWith('.adoc'))
      .map(async (file) => {
        const content = fs.readFileSync(
          path.join(process.cwd(), 'content', file),
          'utf-8'
        );
        const doc = asciidoctor.load(content, {
          attributes: { showtitle: '' },
          safe: 'safe',
        });
        return {
          slug: file.replace('.adoc', ''),
          title: doc.getDocumentTitle(),
          category: doc.getAttribute('category') || 'Uncategorized',
          description: doc.getAttribute('description') || '',
        };
      })
  );

  // Get current article
  const document = asciidoctor.load(adocContent, {
    attributes: {
      toc: '',
      noheader: '',
      imagesdir: '/images',
    },
    safe: 'unsafe',
  });

  const title = document.getDocumentTitle() || params.slug.replace(/-/g, ' ');
  const category = document.getAttribute('category') || 'Uncategorized';
  const description = document.getAttribute('description') || '';

  // Get related articles (same category)
  const relatedArticles = allArticles
    .filter(
      (article) =>
        article.slug !== params.slug && article.category === category
    )
    .slice(0, 3);

  // Get all categories for sidebar
  const categories = [
    ...new Set(allArticles.map((article) => article.category)),
  ];

  // Extract all sections to manually create TOC
  const sections = document.getSections().map((section) => ({
    id: section.getId(),
    title: section.getTitle(),
    level: section.getLevel(),
    subSections: section.getSections().map((sub) => ({
      id: sub.getId(),
      title: sub.getTitle(),
      level: sub.getLevel(),
    })),
  }));

  // Create manual TOC in HTML format
  let toc = '<ul class="sectlevel1">';
  sections.forEach((section) => {
    toc += `<li><a href="#${section.id}">${section.title}</a>`;
    if (section.subSections.length > 0) {
      toc += '<ul class="sectlevel2">';
      section.subSections.forEach((sub) => {
        toc += `<li><a href="#${sub.id}">${sub.title}</a></li>`;
      });
      toc += '</ul>';
    }
    toc += '</li>';
  });
  toc += '</ul>';

  // Extract only main content
  let contentHtml = '';
  const blocks = document.getBlocks();
  for (const block of blocks) {
    if (block.getContext() !== 'toc' && block.getContext() !== 'preamble') {
      contentHtml += block.convert();
    }
  }

  return {
    props: {
      html: contentHtml || '<p>Content not available</p>',
      toc: toc || '<p>TOC not available</p>',
      title,
      category,
      description,
      relatedArticles,
      categories,
    },
  };
}

export default function ArtikelPage({
  html,
  toc,
  title,
  category,
  description,
  relatedArticles,
  categories,
}: {
  html: string;
  toc: string;
  title: string;
  category: string;
  description: string;
  relatedArticles: { slug: string; title: string; description: string }[];
  categories: string[];
}) {
  const router = useRouter();

  useEffect(() => {
    hljs.highlightAll();

    // Add custom styling
    const style = document.createElement('style');
    style.textContent = `
      .imageblock {
        margin: 2rem 0;
      }
      .imageblock .content {
        display: flex;
        justify-content: center;
      }
      .imageblock img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }
      .imageblock img:hover {
        transform: scale(1.02);
      }
      .imageblock.right {
        float: right;
        margin: 0 0 1rem 1.5rem;
        max-width: 50%;
      }
      .imageblock.left {
        float: left;
        margin: 0 1.5rem 1rem 0;
        max-width: 50%;
      }
      .imageblock.center {
        margin: 2rem auto;
        display: block;
        text-align: center;
      }
      .imageblock .title {
        font-size: 0.9rem;
        text-align: center;
        color: #9ca3af;
        margin-top: 0.5rem;
      }
      .related-articles {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #374151;
      }
      .related-articles h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #f3f4f6;
      }
      .related-articles-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .related-article-card {
        background: #1f2937;
        padding: 1.5rem;
        border-radius: 0.5rem;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .related-article-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      .related-article-card h3 {
        font-size: 1.125rem;
        margin-bottom: 0.5rem;
        color: #e5e7eb;
      }
      .category-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #374151;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>{title} | IT Learning Hub</title>
        <meta name="description" content={description} />
      </Head>
      <Header />
      <div className="flex bg-gray-900 min-h-screen pt-16">
        <Sidebar categories={categories} currentCategory={category} />
        <main className="flex-1 p-8 font-mono text-gray-100 ml-64 mr-64">
          <header className="mb-8">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 text-sm font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Kembali
                </button>
                <Link
                  href={`/kategori/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="category-badge hover:bg-gray-600 transition-colors"
                >
                  {category}
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-100">{title}</h1>
              {description && (
                <p className="text-gray-400 text-lg">{description}</p>
              )}
            </div>
          </header>
          <article
            className="prose prose-invert max-w-5xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {relatedArticles.length > 0 && (
            <div className="related-articles max-w-5xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6">
                Artikel Terkait dalam {category}
              </h2>
              <div className="related-articles-list">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/artikel/${article.slug}`}
                    passHref
                  >
                    <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                      <h3 className="text-xl font-semibold mb-2">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-gray-400">{article.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Footer />
        </main>
        <aside className="w-64 bg-gray-800 p-4 border-l border-gray-700 fixed right-0 top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Daftar Isi
          </h2>
          <div
            className="text-gray-300 text-sm"
            dangerouslySetInnerHTML={{ __html: toc }}
          />
        </aside>
      </div>
    </>
  );
}