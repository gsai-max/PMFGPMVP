'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, MapPin, User, LogOut } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export const Header: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { items, toggleCart, fetchCart } = useCartStore();
  const { user, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    fetchCart();
  }, [initAuth, fetchCart]);

  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-3xl font-black tracking-tight text-blinkit-yellow bg-black px-3 py-1 rounded-xl">
                blink<span className="text-blinkit-green">clone</span>
              </span>
            </Link>

            <div className="hidden md:flex flex-col text-xs text-gray-600 border-l border-gray-200 pl-6">
              <div className="flex items-center gap-1 font-bold text-gray-900 text-sm">
                <MapPin className="w-4 h-4 text-blinkit-green fill-blinkit-green/20" />
                Delivery in 10 minutes
              </div>
              <span className="text-gray-500 truncate max-w-[200px]">Koramangala 4th Block, Bengaluru</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder='Search "milk", "eggs", "bread", or "chips"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-blinkit-bg border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blinkit-green focus:bg-white transition-all shadow-inner"
              />
            </div>
          </form>

          {/* User Account & Cart CTA */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-blinkit-green transition"
                >
                  <User className="w-4 h-4" />
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-bold text-gray-800 hover:text-blinkit-green px-3 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Login
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => toggleCart(true)}
              className="flex items-center gap-3 bg-blinkit-green hover:bg-blinkit-darkGreen text-white px-4 py-2.5 rounded-xl font-bold transition shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blinkit-yellow text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-tight text-xs">
                {totalItemCount > 0 ? (
                  <>
                    <span className="font-extrabold text-sm">₹{totalCartPrice}</span>
                    <span className="text-[10px] opacity-90">{totalItemCount} items</span>
                  </>
                ) : (
                  <span className="font-bold text-sm">My Cart</span>
                )}
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
