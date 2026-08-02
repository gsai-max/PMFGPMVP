'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Plus, Minus, ShieldCheck, Clock, Tag } from 'lucide-react';
import { api } from '../../../lib/api';
import { useCartStore } from '../../../store/cartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity } = useCartStore();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  if (loading) return <div className="py-20 text-center text-gray-400 font-semibold">Loading product details...</div>;
  if (!product) return <div className="py-20 text-center text-gray-500 font-bold">Product not found.</div>;

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Product Image */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center p-6 border border-gray-100">
        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-blue-600 text-white font-black text-xs uppercase px-3 py-1 rounded-lg z-10">
            {discountPercent}% OFF
          </span>
        )}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-contain p-4"
          unoptimized
        />
      </div>

      {/* Product Details & Actions */}
      <div className="flex flex-col justify-between space-y-6">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            {product.subcategory} • {product.unit}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
            )}
            <span className="text-xs font-bold text-blinkit-green bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
              Inclusive of all taxes
            </span>
          </div>

          {/* ADD / Quantity Stepper CTA */}
          <div className="mb-8">
            {quantity === 0 ? (
              <button
                onClick={() => addItem(product.id, 1)}
                className="w-full sm:w-auto bg-blinkit-green hover:bg-blinkit-darkGreen text-white px-8 py-3.5 rounded-2xl font-black text-base transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                ADD TO CART
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-blinkit-green text-white px-4 py-2.5 rounded-2xl w-fit shadow-lg">
                <button
                  onClick={() => updateQuantity(cartItem!.id, quantity - 1)}
                  className="p-1 hover:bg-blinkit-darkGreen rounded-lg transition"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-3 font-black text-lg">{quantity}</span>
                <button
                  onClick={() => updateQuantity(cartItem!.id, quantity + 1)}
                  className="p-1 hover:bg-blinkit-darkGreen rounded-lg transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <Clock className="w-4 h-4 text-blinkit-green shrink-0" />
              <span>Delivered in 10 minutes from your local dark store</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>100% Quality & Freshness Guarantee</span>
            </div>
          </div>
        </div>

        {/* Mission Tags */}
        {product.missionTags?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1 mb-1">
              <Tag className="w-3.5 h-3.5 text-amber-700" />
              AI Mission Tags:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {product.missionTags.map((tag: string) => (
                <span key={tag} className="bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
