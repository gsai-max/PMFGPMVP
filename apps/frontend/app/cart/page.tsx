'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Plus, Minus, Tag, Clock, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { MissionCompletionWidget } from '../../components/mission/MissionCompletionWidget';

export default function CartPage() {
  const { items, updateQuantity, discountAmount, appliedCoupon, applyCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal > 299 ? 0 : 25;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.response?.data?.error || 'Failed to apply coupon');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
        <h1 className="text-2xl font-black text-gray-900">Your Cart is Empty</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explore our categories and add fresh groceries or quick essentials to get 10-minute delivery.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blinkit-green hover:bg-blinkit-darkGreen text-white px-6 py-3 rounded-2xl text-xs font-extrabold shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blinkit-green" />
          Shopping Cart ({items.length} items)
        </h1>
        <Link href="/" className="text-xs font-extrabold text-blinkit-green hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
      </div>

      {/* AI Mission Completion Banner */}
      <MissionCompletionWidget />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cart Items List */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blinkit-green shrink-0" />
            <div>
              <div className="text-xs font-black text-blinkit-darkGreen">Delivery in 10 minutes</div>
              <div className="text-[11px] text-gray-600">Dispatched from your nearest dark store</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{item.product.name}</h3>
                  <div className="text-xs text-gray-500">{item.product.unit}</div>
                  <div className="font-black text-sm text-gray-900 mt-1">₹{item.product.price * item.quantity}</div>
                </div>

                {/* Stepper */}
                <div className="flex items-center bg-blinkit-green text-white rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-blinkit-darkGreen transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-blinkit-darkGreen transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-gray-100 pt-4">
            <form onSubmit={handleCouponSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Coupon (e.g. WELCOME100)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full text-xs uppercase bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blinkit-green font-semibold"
                />
              </div>
              <button
                type="submit"
                className="bg-black text-white text-xs font-extrabold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="text-xs text-blinkit-green font-bold mt-2 flex items-center gap-1">
                ✓ Coupon "{appliedCoupon}" applied (-₹{discountAmount})
              </div>
            )}
            {couponError && (
              <div className="text-xs text-red-600 font-medium mt-2">{couponError}</div>
            )}
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h2 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Bill Details</h2>

          <div className="text-xs space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-gray-900">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-blinkit-green font-semibold">
                <span>Coupon Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-semibold text-gray-900">
                {deliveryFee === 0 ? <span className="text-blinkit-green font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-3">
              <span>Grand Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-blinkit-green hover:bg-blinkit-darkGreen text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition active:scale-95"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
