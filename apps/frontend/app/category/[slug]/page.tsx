'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { ProductCard } from '../../../components/ui/ProductCard';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSub, setSelectedSub] = useState<string>('');
  const [sort, setSort] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `/products?category=${slug}`;
    if (selectedSub) url += `&subcategory=${encodeURIComponent(selectedSub)}`;
    if (sort) url += `&sort=${sort}`;

    api.get(url).then((res) => {
      setProducts(res.data.products);
      // Extract unique subcategories
      const subs = Array.from(new Set(res.data.products.map((p: any) => p.subcategory))) as string[];
      if (subcategories.length === 0) setSubcategories(subs);
      setLoading(false);
    }).catch(console.error);
  }, [slug, selectedSub, sort]);

  return (
    <div className="space-y-6">
      
      {/* Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 capitalize">
            {slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-xs text-gray-500">{products.length} products available</p>
        </div>

        {/* Sort Filter */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-blinkit-green"
        >
          <option value="">Sort by: Popularity</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Subcategory Pills */}
      {subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSub('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
              selectedSub === ''
                ? 'bg-blinkit-green text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Products
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                selectedSub === sub
                  ? 'bg-blinkit-green text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-semibold">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-bold bg-white rounded-2xl border border-gray-100">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
