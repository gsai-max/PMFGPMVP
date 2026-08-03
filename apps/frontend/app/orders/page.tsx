'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => {
        setOrders(res.data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-gray-400 font-semibold">Loading past orders...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Your Order History</h1>
        <span className="text-xs text-gray-500 font-bold">{orders.length} total orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-200" />
          <p className="text-lg text-gray-900 font-black">No past orders yet</p>
          <p className="text-xs text-gray-500 font-medium">Items you order will appear here for easy tracking and re-ordering.</p>
          <Link href="/" className="inline-block bg-blinkit-green text-white font-bold text-xs px-5 py-2.5 rounded-xl">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition space-y-4 group"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="text-xs font-black text-gray-900">Order #{order.id}</div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-blinkit-darkGreen font-extrabold text-[11px] px-3 py-1 rounded-full uppercase">
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Order Thumbnails */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  {order.items?.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="relative w-10 h-10 rounded-xl bg-gray-50 border overflow-hidden shrink-0">
                      <Image
                        src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-sm font-black text-gray-900">₹{order.totalAmount}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
