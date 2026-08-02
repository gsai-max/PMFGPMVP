'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Clock, PackageCheck, Bike, Home, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: CheckCircle2 },
  { key: 'PACKED', label: 'Packed at Dark Store', icon: PackageCheck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
  { key: 'DELIVERED', label: 'Delivered in 10 mins', icon: Home },
];

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = () => {
      api.get(`/orders/${id}`).then((res) => {
        setOrder(res.data);
        setLoading(false);
      }).catch(console.error);
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Auto-poll status
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="py-20 text-center text-gray-400 font-semibold">Loading order status...</div>;
  if (!order) return <div className="py-20 text-center text-gray-500 font-bold">Order not found.</div>;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Success Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-3">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Order Placed Successfully!</h1>
        <p className="text-sm text-green-100 font-semibold">
          Order ID: #{order.id.slice(0, 8)} • Arriving in ~10 minutes
        </p>
      </div>

      {/* Live Order Status Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 font-black text-lg text-gray-900">
            <Clock className="w-5 h-5 text-blinkit-green" />
            Live Delivery Tracker
          </div>
          <span className="bg-green-100 text-blinkit-darkGreen font-extrabold text-xs px-3 py-1 rounded-full uppercase">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Steps Progress */}
        <div className="grid grid-cols-4 gap-2 text-center relative">
          {STATUS_STEPS.map((step, idx) => {
            const IconComp = step.icon;
            const isDone = idx <= currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-blinkit-green text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Items in this Order</h3>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-gray-50 overflow-hidden border">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-gray-900">{item.product.name}</h4>
                  <span className="text-[11px] text-gray-500">Qty: {item.quantity} • ₹{item.priceAtPurchase} each</span>
                </div>
              </div>
              <span className="font-bold text-xs text-gray-900">₹{item.priceAtPurchase * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-3 text-xs space-y-1 text-gray-600">
          <div className="flex justify-between font-black text-sm text-gray-900">
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-blinkit-green hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>

    </div>
  );
}
