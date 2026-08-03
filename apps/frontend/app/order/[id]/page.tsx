'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Clock, PackageCheck, Bike, Home, ArrowLeft, MapPin, Phone, Star, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: CheckCircle2, desc: 'Received at dark store' },
  { key: 'PACKED', label: 'Packed & Sealed', icon: PackageCheck, desc: 'Quality checked by store manager' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike, desc: 'Partner assigned and en route' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Handed over at doorstep' },
];

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(585); // ~9 mins 45 secs

  useEffect(() => {
    const fetchOrder = () => {
      api.get(`/orders/${id}`).then((res) => {
        setOrder(res.data);
        setLoading(false);
      }).catch(console.error);
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Auto-poll status every 5s
    return () => clearInterval(interval);
  }, [id]);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 font-semibold flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-blinkit-green animate-spin" />
        Fetching order status...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto shadow-sm space-y-3">
        <p className="text-lg text-gray-900 font-black">Order Not Found</p>
        <p className="text-xs text-gray-500">The order details could not be loaded.</p>
        <Link href="/" className="inline-block bg-blinkit-green text-white font-bold text-xs px-5 py-2 rounded-xl">
          Back to Homepage
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Success Banner with Live Countdown Timer */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1 bg-yellow-400 text-black font-black text-[11px] uppercase px-3 py-1 rounded-full shadow">
              <CheckCircle2 className="w-3.5 h-3.5 fill-black text-yellow-400" />
              Order Confirmed & Dispatching
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Arriving in ~{formatCountdown(countdownSeconds)}</h1>
            <p className="text-xs text-green-100 font-medium">
              Order ID: <span className="font-bold text-white">#{order.id}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center shrink-0">
            <div className="text-[10px] text-green-200 uppercase font-black tracking-wider">Estimated Delivery</div>
            <div className="text-2xl font-black text-yellow-300">{formatCountdown(countdownSeconds)}</div>
            <div className="text-[10px] text-green-100">Superfast Dark Store</div>
          </div>
        </div>
      </div>

      {/* Live Delivery Status Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 font-black text-lg text-gray-900">
            <Clock className="w-5 h-5 text-blinkit-green" />
            Live Delivery Tracker
          </div>
          <span className="bg-green-100 text-blinkit-darkGreen font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
            Status: {order.status.replace(/_/g, ' ')}
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
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-blinkit-green text-white shadow-lg scale-105 ring-4 ring-green-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className={`text-xs font-black ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-gray-500 hidden sm:block font-medium">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulated Dark Store Map Card */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-blinkit-green/20 border border-blinkit-green flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-gray-300">Dark Store Dispatch Center</div>
              <div className="text-sm font-black text-white">Hub #402 • Koramangala, Bengaluru</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold z-10">
            <MapPin className="w-4 h-4 text-blinkit-green" />
            <span>0.8 km to your location</span>
          </div>
        </div>

        {/* Delivery Executive Details Card */}
        <div className="bg-green-50/60 border border-green-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-lg border-2 border-white shadow">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-gray-900">Ramesh Kumar</span>
                <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-black" /> 4.9
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Blinkit Delivery Partner • KA-05-EV-4091</p>
            </div>
          </div>

          <button className="bg-white border border-green-300 text-blinkit-darkGreen p-2.5 rounded-xl hover:bg-green-100 transition shadow-sm">
            <Phone className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Items Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Items in this Order</h3>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-gray-50 overflow-hidden border shrink-0">
                  <Image
                    src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
                    alt={item.product?.name || 'Product'}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{item.product?.name}</h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Qty: {item.quantity} • ₹{item.priceAtPurchase} each
                  </span>
                </div>
              </div>
              <span className="font-black text-xs text-gray-900">₹{item.priceAtPurchase * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-3 text-xs space-y-1.5 text-gray-600">
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-blinkit-green font-bold">
              <span>Coupon Discount</span>
              <span>-₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-gray-900">
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black text-blinkit-green hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>

    </div>
  );
}
