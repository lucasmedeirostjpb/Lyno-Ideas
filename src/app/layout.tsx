import type { Metadata } from 'next';
import { Atkinson_Hyperlegible } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atkinson',
});

export const metadata: Metadata = {
  title: 'Lyno Ideias · 15ª Fetech',
  description: 'Envie suas ideias inovadoras para ajudar a resolver os gargalos reais do judiciário paraibano.',
  metadataBase: new URL('https://lyno-ideias.vercel.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={atkinson.variable} data-scroll-behavior="smooth">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: '1 0 auto' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
