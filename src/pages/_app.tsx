import type { AppProps } from 'next/app';
import { SidebarProvider } from '@/components/SidebarContext';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SidebarProvider>
      <Component {...pageProps} />
    </SidebarProvider>
  );
}

export default MyApp;