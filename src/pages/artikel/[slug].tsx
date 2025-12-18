import fs from 'fs';
import path from 'path';
import Asciidoctor from 'asciidoctor';
import Head from 'next/head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import NavMobile from '@/components/NavMobile';
import AdUnit from '@/components/AdUnit';
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
  const { isSidebarOpen } = useSidebar();
  const [shareUrl, setShareUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [absoluteThumbnail, setAbsoluteThumbnail] = useState('');

  useEffect(() => {
    // Dapatkan URL dinamis berdasarkan environment
    const origin = window.location.origin;
    setSiteUrl(origin);
    setShareUrl(window.location.href);
    
    // Cek apakah thumbnail tersedia
    if (thumbnail) {
      setAbsoluteThumbnail(thumbnail.startsWith('http') ? thumbnail : `${origin}${thumbnail}`);
    }
  }, [thumbnail]);

  useEffect(() => {
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
        <meta property="og:site_name" content="RuangCodes" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {siteUrl && <meta property="og:url" content={`${siteUrl}/artikel/${slug}`} />}
        {absoluteThumbnail && <meta property="og:image" content={absoluteThumbnail} />}
        {absoluteThumbnail && <meta property="og:image:secure_url" content={absoluteThumbnail} />}
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />

        {/* Twitter/X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ruangcodes" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {absoluteThumbnail && <meta name="twitter:image" content={absoluteThumbnail} />}

        {/* Fallback untuk platform lain */}
        {absoluteThumbnail && <meta name="image" content={absoluteThumbnail} />}
        {siteUrl && <link rel="canonical" href={`${siteUrl}/artikel/${slug}`} />}
      </Head>
      <Header />
      <div className="flex min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden md:block">
          <Sidebar categories={allCategories} currentCategory={categories[0]} />
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <NavMobile categories={allCategories} currentCategory={categories[0]} />
        )}
        <main
          className={`flex-1 px-4 py-5 md:p-8 font-mono text-[var(--text-primary)] transition-all duration-300 ml-0 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
            }`}
        >
          <header className="mb-5 md:mb-8">
            <div className="flex flex-col space-y-3 md:space-y-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 text-xs md:text-sm font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2"
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
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/kategori/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      className="category-badge text-[10px] md:text-xs hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
              {description && (
                <p className="text-[var(--text-tertiary)] text-sm md:text-lg">{description}</p>
              )}
            </div>
          </header>
          <article
            className="prose max-w-5xl mx-auto bg-[var(--bg-card)] p-4 md:p-8 rounded-lg border border-[var(--border-primary)]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="max-w-5xl mx-auto mt-8 md:mt-12">
            <h2 className="text-base md:text-xl font-semibold text-[var(--text-secondary)] mb-3 md:mb-4">
              Bagikan Artikel Ini
            </h2>
            <div className="flex items-center gap-3 md:gap-4">
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
                className="bg-black hover:bg-gray-800 text-white p-3 rounded-full transition"
                title="Bagikan ke X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 hover:bg-sky-400 text-white p-3 rounded-full transition"
                title="Bagikan ke Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-800 hover:bg-blue-700 text-white p-3 rounded-full transition"
                title="Bagikan ke LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link berhasil disalin!');
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-full transition"
                title="Salin Link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Baca artikel menarik ini: ${shareUrl}`)}`}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition"
                title="Bagikan via Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Ad Unit - After Share Buttons */}
          <div className="max-w-5xl mx-auto mt-8 md:mt-12">
            <AdUnit 
              slot="8844646736" 
              format="horizontal" 
              className="py-4"
            />
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
                    <div className="h-full flex flex-col p-3 md:p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200">
                      <div className="w-full aspect-[16/9] mb-2 md:mb-3 overflow-hidden rounded-md bg-[var(--bg-tertiary)]">
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
                        <p className="text-xs md:text-sm text-[var(--text-tertiary)] line-clamp-2 md:line-clamp-3 flex-grow">
                          {article.description}
                        </p>
                      )}
                      <div className="mt-2 md:mt-3 pt-2 border-t border-[var(--border-primary)]">
                        <span className="text-xs text-[var(--text-tertiary)]">
                          Baca selengkapnya →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ad Unit - Before Footer */}
          <div className="max-w-5xl mx-auto mt-8 md:mt-12">
            <AdUnit 
              slot="3417060239" 
              format="auto" 
              className="py-4"
            />
          </div>

          <Footer />
        </main>
      </div>
    </>
  );
}