'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { MOCK_CATEGORIES } from '../../lib/mockData';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: string[];
}

export const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm overflow-x-auto scrollbar-none py-2.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 text-xs font-bold whitespace-nowrap">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-1.5 text-gray-700 hover:text-blinkit-green hover:bg-green-50 px-3 py-1.5 rounded-xl transition border border-transparent hover:border-green-200"
          >
            <span>{cat.icon || '🛒'}</span>
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
