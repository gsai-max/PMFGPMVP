'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, RefreshCw, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/cartStore';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchCart, toggleCart } = useCartStore();

  useEffect(() => {
    api.get('/orders').then((res) => {
      setOrders(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleReorder = async (orderId: string) => {
    try {
      const res = await api.post(`/orders/${orderId}/reorder`);
      const newCart = res.data;
      if (newCart?.id && typeof window !== 'undefined') {
        localStorage.setItem('blinkclone_cart_id', newCart.id);
        await fetchCart();
        toggleCart(true);
      }
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Order History</h1>
        <span className="text-xs font-bold text-gray-500">{orders.length} past orders</span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-semibold">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100 space-y-3">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <p>No previous orders found.</p>
          <Link href="/" className="inline-block bg-blinkit-green text-white text-xs font-bold px-4 py-2 rounded-xl">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Order #{ord.id.slice(0, 8)}</div>
                  <div className="text-[11px] text-gray-400">
                    {new Date(ord.placedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-green-50 text-blinkit-green border border-green-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    {ord.status}
                  </span>
                  <span className="font-extrabold text-sm text-gray-900">₹{ord.totalAmount}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="text-xs text-gray-600 space-y-1">
                {ord.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product?.name}</span>
                    <span className="font-semibold text-gray-900">₹{item.priceAtPurchase * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Link
                  href={`/order/${ord.id}`}
                  className="text-xs font-bold text-gray-600 hover:text-blinkit-green flex items-center gap-1"
                >
                  View Details & Live Tracking
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleReorder(ord.id)}
                  className="bg-blinkit-green hover:bg-blinkit-darkGreen text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  REORDER
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
