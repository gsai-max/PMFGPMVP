'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, MapPin, User, LogOut, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

const LOCATIONS = [
  { name: 'Koramangala 4th Block', city: 'Bengaluru', pin: '560034' },
  { name: 'Indiranagar 100ft Road', city: 'Bengaluru', pin: '560038' },
  { name: 'HSR Layout Sector 1', city: 'Bengaluru', pin: '560102' },
  { name: 'Bandra West, Hill Road', city: 'Mumbai', pin: '400050' },
  { name: 'Connaught Place, Inner Circle', city: 'New Delhi', pin: '110001' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const { items, toggleCart, fetchCart, addItem } = useCartStore();
  const { user, logout, initAuth } = useAuthStore();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
    fetchCart();
  }, [initAuth, fetchCart]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced instant search autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      api.get(`/products?q=${encodeURIComponent(searchQuery.trim())}&limit=5`)
        .then((res) => {
          setSearchResults(res.data.products || []);
          setShowSearchDropdown(true);
        })
        .finally(() => setIsSearching(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          
          {/* Logo & Location Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-blinkit-yellow bg-black px-3 py-1 rounded-xl group-hover:scale-105 transition-transform">
                blink<span className="text-blinkit-green">clone</span>
              </span>
            </Link>

            {/* Location Pill with Modal Trigger */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex flex-col text-left text-xs text-gray-600 border-l border-gray-200 pl-4 hover:opacity-80 transition"
            >
              <div className="flex items-center gap-1 font-extrabold text-gray-900 text-sm">
                <MapPin className="w-4 h-4 text-blinkit-green fill-blinkit-green/20 shrink-0" />
                <span>10-Min Delivery</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <span className="text-gray-500 truncate max-w-[180px] font-medium">{selectedLocation.name}</span>
            </button>
          </div>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder='Search "milk", "eggs", "bread", or "chips"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  className="w-full bg-blinkit-bg border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blinkit-green focus:bg-white transition-all shadow-inner font-medium text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-100">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-400 font-semibold">Searching catalog...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">No items found for "{searchQuery}"</div>
                ) : (
                  <>
                    <div className="p-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3">
                      Instant Search Results
                    </div>
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-3 hover:bg-green-50/50 transition flex items-center justify-between gap-3 cursor-pointer"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          router.push(`/product/${prod.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg bg-gray-50 overflow-hidden border shrink-0">
                            <Image src={prod.imageUrl} alt={prod.name} fill className="object-contain p-1" unoptimized />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-gray-900">{prod.name}</h4>
                            <span className="text-[11px] text-gray-500">{prod.unit} • ₹{prod.price}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(prod.id, 1);
                            setShowSearchDropdown(false);
                          }}
                          className="bg-green-50 border border-blinkit-green text-blinkit-green hover:bg-blinkit-green hover:text-white px-3 py-1 rounded-lg text-xs font-black transition uppercase"
                        >
                          ADD
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Account & Cart CTA */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-blinkit-green px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  <User className="w-4 h-4 text-blinkit-green" />
                  <span className="hidden sm:inline">My Orders</span>
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
                className="text-xs font-bold text-gray-800 hover:text-blinkit-green px-3 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Login
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => toggleCart(true)}
              className="flex items-center gap-2.5 sm:gap-3 bg-blinkit-green hover:bg-blinkit-darkGreen text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-black transition shadow-md hover:shadow-lg active:scale-95 shrink-0"
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
                    <span className="font-extrabold text-xs sm:text-sm">₹{totalCartPrice}</span>
                    <span className="text-[10px] opacity-90">{totalItemCount} items</span>
                  </>
                ) : (
                  <span className="font-bold text-xs sm:text-sm">My Cart</span>
                )}
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-black text-base text-gray-900">
                <MapPin className="w-5 h-5 text-blinkit-green" />
                Select Delivery Location
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {LOCATIONS.map((loc) => {
                const isSelected = loc.name === selectedLocation.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationModal(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blinkit-green bg-green-50/60 font-bold'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-gray-900">{loc.name}</div>
                      <div className="text-[11px] text-gray-500">{loc.city} - {loc.pin}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blinkit-green" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
