import type {Metadata} from 'next';
import './globals.css';

const BASE_URL = 'https://digitalgen.vercel.app';

export const metadata: Metadata = {
  title: 'Super G & N | Supermercado Online',
  description: 'Supermercado Super G & N — Av. XVII, 404, Pacatuba - CE. Aberto até 23h. Compre online com entrega rápida.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Super G & N',
    title: 'Super G & N | Supermercado Online',
    description: 'Compre no Super G & N em Pacatuba, CE. Hortifruti, congelados, bebidas e muito mais. Entrega rápida!',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Super G & N Supermercado Online',
      },
    ],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super G & N | Supermercado Online',
    description: 'Compre no Super G & N em Pacatuba, CE. Entrega rápida!',
    images: ['/og-image.jpg'],
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
