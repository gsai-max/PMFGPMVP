'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  children?: Category[];
}

export const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data);
    }).catch(console.error);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm overflow-x-auto scrollbar-none py-2.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-xs font-semibold whitespace-nowrap">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-2 text-gray-700 hover:text-blinkit-green hover:bg-green-50 px-3 py-1.5 rounded-lg transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};
