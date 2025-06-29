import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import NavMobile from '@/components/NavMobile';
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSidebar } from '@/components/SidebarContext';
import Image from 'next/image';

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
        const categories = (doc.getAttribute('categories') || 'Uncategorized')
          .split(',')
          .map((cat: string) => cat.trim());
        return {
          slug: file.replace('.adoc', ''),
          title: doc.getDocumentTitle(),
          categories,
          description: doc.getAttribute('description') || '',
          thumbnail: doc.getAttribute('thumbnail') || '/images/default-thumbnail.png',
        };
      })
  );

  // Get current article
  const document = asciidoctor.load(adocContent, {
    attributes: {
      toc: '',
      noheader: '',
      imagesdir: '/images',
      sourcehighlighter: 'highlightjs',
      highlightjsdir: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0',
      highlightjsstyle: 'atom-one-dark',
      'link-base-path': '/artikel/',
    },
    safe: 'unsafe',
  });

  const title = document.getDocumentTitle() || params.slug.replace(/-/g, ' ');
  const categories = (document.getAttribute('categories') || 'Uncategorized')
    .split(',')
    .map((cat: string) => cat.trim());
  const description = document.getAttribute('description') || '';

  // Get related articles (any matching category)
  const relatedArticles = allArticles
    .filter(
      (article) =>
        article.slug !== params.slug &&
        article.categories.some((cat: string) => categories.includes(cat))
    )
    .slice(0, 2);

  // Get all categories for sidebar
  const allCategories = [
    ...new Set(
      allArticles.flatMap((article: { categories: string[] }) => article.categories)
    ),
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
    if (block.getContext() !== 'toc') {
      contentHtml += block.convert();
    }
  }

  contentHtml = contentHtml
    .replace(/href="([^"]+)\.html"/g, 'href="/artikel/$1"')
    .replace(/href="([^"]+)\.adoc"/g, 'href="/artikel/$1"')
    .replace(/href="\.\/([^"]+)"/g, 'href="/artikel/$1"');

  return {
    props: {
      html: contentHtml || '<p>Content not available</p>',
      toc: toc || '<p>TOC not available</p>',
      title,
      categories,
      description,
      relatedArticles: relatedArticles.map((article) => ({
        ...article,
        thumbnail: article.thumbnail || '/images/default-thumbnail.png',
        slug: article.slug,
      })),
      allCategories,
    },
  };
}

export default function ArtikelPage({
  html,
  toc,
  title,
  categories,
  description,
  relatedArticles,
  allCategories,
  thumbnail,
  slug,
}: {
  html: string;
  toc: string;
  title: string;
  categories: string[];
  description: string;
  relatedArticles: { slug: string; title: string; description: string; thumbnail: string; categories: string[] }[];
  allCategories: string[];
  thumbnail: string;
  slug: string;
}) {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);

    const registerLanguages = async () => {
      try {
        const languages = {
          go: (await import('highlight.js/lib/languages/go')).default,
          javascript: (await import('highlight.js/lib/languages/javascript')).default,
          python: (await import('highlight.js/lib/languages/python')).default,
          java: (await import('highlight.js/lib/languages/java')).default,
          cpp: (await import('highlight.js/lib/languages/cpp')).default,
          bash: (await import('highlight.js/lib/languages/bash')).default,
          sql: (await import('highlight.js/lib/languages/sql')).default,
          xml: (await import('highlight.js/lib/languages/xml')).default,
          yaml: (await import('highlight.js/lib/languages/yaml')).default,
        };

        Object.entries(languages).forEach(([lang, module]) => {
          hljs.registerLanguage(lang, module);
        });

        hljs.highlightAll();
      } catch (error) {
        console.error('Error registering highlight.js languages:', error);
      }
    };

    registerLanguages();

    const style = document.createElement('style');
    style.textContent = `
      .imageblock {
        margin: 2rem 0;
      }
      .imageblock .content {
        display: flex;
        justify-content: center;
      }
      .imageblock Image {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }
      .imageblock Image:hover {
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
      pre code.hljs {
        display: block;
        overflow-x: auto;
        padding: 1.5em;
        border-radius: 0.5rem;
        background: #282c34;
        color: #abb2bf;
        font-family: 'Fira Code', 'Courier New', monospace;
        line-height: 1.6;
        tab-size: 4;
        margin: 1.5rem 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .hljs-comment,
      .hljs-quote {
        color: #5c6370;
        font-style: italic;
      }
      .hljs-doctag,
      .hljs-keyword,
      .hljs-formula {
        color: #c678dd;
      }
      .hljs-section,
      .hljs-name,
      .hljs-selector-tag,
      .hljs-deletion,
      .hljs-subst {
        color: #e06c75;
      }
      .hljs-literal {
        color: #56b6c2;
      }
      .hljs-string,
      .hljs-regexp,
      .hljs-addition,
      .hljs-attribute,
      .hljs-meta-string {
        color: #98c379;
      }
      .hljs-built_in,
      .hljs-class .hljs-title {
        color: #e6c07b;
      }
      .hljs-attr,
      .hljs-variable,
      .hljs-template-variable,
      .hljs-type,
      .hljs-selector-class,
      .hljs-selector-attr,
      .hljs-selector-pseudo,
      .hljs-number {
        color: #d19a66;
      }
      .hljs-symbol,
      .hljs-bullet,
      .hljs-link,
      .hljs-meta,
      .hljs-selector-id,
      .hljs-title {
        color: #61aeee;
      }
      .hljs-emphasis {
        font-style: italic;
      }
      .hljs-strong {
        font-weight: bold;
      }
      .prose a {
        color: #60a5fa;
        text-decoration: underline;
        transition: color 0.2s ease, background-color 0.2s ease;
        border-radius: 3px;
        padding: 0 2px;
      }
      .prose a:hover {
        color: #93c5fd;
        background-color: rgba(96, 165, 250, 0.1);
        text-decoration: none;
      }
      .prose a:visited {
        color: #a78bfa;
      }
      .prose a:focus {
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
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
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
      }
      aside.w-16 {
        padding: 0.5rem;
      }
      aside.w-16 div {
        display: none;
      }
      aside.w-16:hover {
        width: 64px;
      }
      aside.w-16:hover div {
        display: block;
      }
      @media (max-width: 1024px) {
        aside {
          display: none;
        }
        main {
          margin-right: 0 !important;
        }
      }
      @media (max-width: 768px) {
        main {
          margin-left: 0 !important;
          padding: 1rem;
        }
        pre code.hljs {
          padding: 1rem;
          font-size: 0.9rem;
        }
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
        <title>{title} | RuangCodes</title>
        <meta name="description" content={description} />
        {/* Open Graph / WhatsApp / Facebook / LinkedIn */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title} | RuangCodes`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://ruangcodes.vercel.app/artikel/${slug}`} />
        <meta property="og:image" content={`https://ruangcodes.vercel.app/artikel/${thumbnail}`} />
        <meta property="og:image:secure_url" content={`https://ruangcodes.vercel.app/artikel/${thumbnail}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | RuangCodes`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`https://ruangcodes.vercel.app${thumbnail}`} />

        {/* Fallback untuk platform yang baca <meta name="image"> */}
        <meta name="image" content={`https://ruangcodes.vercel.app${thumbnail}`} />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header />
      <div className="flex bg-gray-900 min-h-screen pt-16">
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden md:block">
          <Sidebar categories={allCategories} currentCategory={categories[0]} />
        </div>

        {/* Mobile Sidebar and Overlay */}
        {isSidebarOpen && (
          <>
            <div
              className="mobile-overlay"
              onClick={toggleSidebar}
            />
            <NavMobile categories={allCategories} currentCategory={categories[0]} />
          </>
        )}
        <main
          className={`flex-1 p-8 font-mono text-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'
            } ${isSidebarOpen ? 'mr-64' : 'mr-16'}`}
        >
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
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/kategori/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      className="category-badge hover:bg-gray-600 transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
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
          <div className="max-w-5xl mx-auto mt-12">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Bagikan Artikel Ini
            </h2>
            <div className="flex items-center gap-4">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${title} - ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-full transition"
                title="Bagikan ke WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.84 11.84 0 0012 0C5.37 0 .07 6.33.07 13.93c0 2.47.67 4.86 1.95 6.96L0 24l3.24-1.02c1.94 1.12 4.13 1.7 6.38 1.7h.01c7.62 0 13.93-5.31 13.93-12.95a11.9 11.9 0 00-3.04-8.25zM12 21.84c-2.1 0-4.15-.57-5.93-1.65l-.42-.25-1.93.6.63-1.89-.28-.45c-1.17-1.88-1.8-4.04-1.8-6.27C2.27 7.1 6.72 2.66 12 2.66c3.17 0 6.15 1.39 8.22 3.83A9.63 9.63 0 0121.73 13c0 5.3-4.43 9.6-9.73 9.6zm5.3-7.2c-.29-.15-1.71-.85-1.97-.94s-.46-.14-.66.14-.76.94-.93 1.13-.34.21-.63.07-1.22-.45-2.33-1.45a8.59 8.59 0 01-1.58-1.95c-.16-.28-.02-.44.12-.58.13-.13.3-.35.45-.52s.2-.28.3-.46c.1-.18.05-.34-.02-.5s-.66-1.6-.9-2.2c-.24-.57-.5-.5-.66-.51h-.57c-.2 0-.52.08-.79.39s-1.03 1.01-1.03 2.45c0 1.44 1.05 2.83 1.2 3.03.15.2 2.06 3.15 5 4.42.7.3 1.25.48 1.67.61.7.22 1.33.19 1.84.12.56-.08 1.71-.7 1.95-1.36.24-.65.24-1.21.17-1.33-.06-.12-.26-.18-.54-.33z" />
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-400 text-white p-3 rounded-full transition"
                title="Bagikan ke Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.56c-.89.4-1.84.66-2.83.78a4.92 4.92 0 002.15-2.71c-.94.56-1.98.97-3.08 1.2a4.91 4.91 0 00-8.38 4.48A13.94 13.94 0 011.67 3.15a4.89 4.89 0 001.52 6.54A4.89 4.89 0 01.96 9v.06a4.91 4.91 0 003.94 4.81c-.42.12-.86.18-1.31.18-.32 0-.63-.03-.93-.08a4.92 4.92 0 004.6 3.42A9.86 9.86 0 010 19.54a13.94 13.94 0 007.55 2.21c9.06 0 14.01-7.5 14.01-14 0-.21 0-.42-.02-.63a10.03 10.03 0 002.46-2.56z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 hover:bg-blue-600 text-white p-3 rounded-full transition"
                title="Bagikan ke Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.68 0H1.32C.6 0 0 .6 0 1.32v21.36C0 23.4.6 24 1.32 24H12.8v-9.33H9.69v-3.63h3.11V8.41c0-3.07 1.87-4.75 4.6-4.75 1.31 0 2.44.1 2.77.14v3.21h-1.9c-1.49 0-1.78.71-1.78 1.74v2.28h3.56l-.46 3.63h-3.1V24h6.08c.73 0 1.32-.6 1.32-1.32V1.32C24 .6 23.4 0 22.68 0z" />
                </svg>
              </a>
            </div>
          </div>
          {/* Related Articles - Now shows 3 on desktop */}
          {relatedArticles.length > 0 && (
            <div className="related-articles max-w-5xl mx-auto mt-6 md:mt-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
                Artikel Terkait
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/artikel/${article.slug}`}
                    passHref
                  >
                    <div className="h-full flex flex-col p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200">
                      <div className="w-full aspect-[16/9] mb-2 md:mb-3 overflow-hidden rounded-md bg-gray-700">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          className="object-cover w-full h-full"
                          width={640}
                          height={360}
                        />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold mb-1 md:mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-xs md:text-sm text-gray-400 line-clamp-2 md:line-clamp-3 flex-grow">
                          {article.description}
                        </p>
                      )}
                      <div className="mt-2 md:mt-3 pt-2 border-t border-gray-700">
                        <span className="text-xs text-gray-400">
                          Baca selengkapnya →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Footer />
        </main>

        {/* TOC Sidebar - Hidden on mobile */}
        <aside
          className={`hidden md:block bg-gray-800 p-4 border-l border-gray-700 fixed top-16 h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'
            } ${isSidebarOpen ? 'right-0' : 'right-0'}`}
        >
          <h2
            className={`text-lg font-semibold text-gray-100 mb-4 ${!isSidebarOpen && 'hidden'
              }`}
          >
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