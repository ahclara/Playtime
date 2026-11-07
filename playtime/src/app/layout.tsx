import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/AppShell';
import '@fontsource/luckiest-guy';
import '@fontsource/special-elite';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/500.css';
import '@fontsource/rubik/600.css';
import '@fontsource/rubik/700.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Playtime — Fábrica de Brinquedos',
  description: 'Loja de brinquedos Playtime: catálogo, carrinho, compras e gerência.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#f8eedb',
                color: '#0e0a0a',
                border: '3px solid #0e0a0a',
                borderRadius: 12,
                boxShadow: '4px 4px 0 #0e0a0a',
                fontFamily: 'Rubik, system-ui, sans-serif',
                fontWeight: 500,
              },
              success: { iconTheme: { primary: '#22d3c5', secondary: '#0e0a0a' } },
              error: { iconTheme: { primary: '#d01b2b', secondary: '#f8eedb' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
