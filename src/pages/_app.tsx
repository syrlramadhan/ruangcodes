import type { AppProps } from 'next/app';
import { SidebarProvider } from '@/components/SidebarContext';
import { ThemeProvider } from '@/components/ThemeContext';
import '@/styles/globals.css';
import 'highlight.js/styles/atom-one-dark.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Component {...pageProps} />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default MyApp;