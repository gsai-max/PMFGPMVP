'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    unit: string;
    imageUrl: string;
    subcategory: string;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { items, addItem, updateQuantity } = useCartStore();

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col justify-between hover:shadow-lg transition-all group relative">
      
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-br-lg rounded-tl-lg z-10 shadow">
          {discountPercent}% OFF
        </span>
      )}

      {/* Product Image & Title Link */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full h-36 mb-2 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>

        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          {product.unit}
        </div>

        <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 h-8 leading-snug group-hover:text-blinkit-green transition-colors mb-2">
          {product.name}
        </h3>
      </Link>

      {/* Price & Add CTA */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <div>
          <div className="text-sm font-extrabold text-gray-900">₹{product.price}</div>
          {product.mrp > product.price && (
            <div className="text-[11px] text-gray-400 line-through">₹{product.mrp}</div>
          )}
        </div>

        {/* Add / Stepper CTA */}
        {quantity === 0 ? (
          <button
            onClick={() => addItem(product.id, 1)}
            className="bg-green-50 border border-blinkit-green text-blinkit-green hover:bg-blinkit-green hover:text-white px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 uppercase tracking-wide"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center bg-blinkit-green text-white rounded-xl overflow-hidden shadow-md">
            <button
              onClick={() => updateQuantity(cartItem!.id, quantity - 1)}
              className="p-1.5 hover:bg-blinkit-darkGreen transition active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-black">{quantity}</span>
            <button
              onClick={() => updateQuantity(cartItem!.id, quantity + 1)}
              className="p-1.5 hover:bg-blinkit-darkGreen transition active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
