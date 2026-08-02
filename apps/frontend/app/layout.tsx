'use client';

import './globals.css';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '../components/ui/Header';
import { CategoryNav } from '../components/ui/CategoryNav';
import { CartDrawer } from '../components/ui/CartDrawer';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>BlinkClone — Quick Commerce with AI Mission Intelligence</title>
        <meta
          name="description"
          content="BlinkClone delivers groceries in 10 minutes with intent-aware AI Mission Intelligence, dynamic checklists, and smart complementary recommendations."
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col bg-blinkit-bg">
            <Header />
            <CategoryNav />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <CartDrawer />
            <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500 mt-12">
              <p className="font-bold text-gray-800 mb-1">BlinkClone — AI Mission Intelligence MVP</p>
              <p>Inspired by 10-minute quick commerce. Built for demo & evaluation purposes.</p>
            </footer>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
