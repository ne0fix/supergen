import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const BASE_URL = 'https://digitalgen.vercel.app';
const OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  title: 'Super G & N | Supermercado Online',
  description: 'Supermercado Super G & N — Pacatuba, CE. Compre online com entrega rápida.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Super G & N',
    title: 'Super G & N | Supermercado Online',
    description: 'Compre no Super G & N em Pacatuba, CE. Hortifruti, congelados, bebidas e muito mais. Entrega rápida!',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Super G & N' }],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super G & N | Supermercado Online',
    description: 'Compre no Super G & N em Pacatuba, CE. Entrega rápida!',
    images: [OG_IMAGE],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <body className="min-h-screen flex flex-col font-sans bg-white overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
