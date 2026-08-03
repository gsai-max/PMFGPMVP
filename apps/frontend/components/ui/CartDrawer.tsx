'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ArrowRight, Tag, Clock, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { MissionCompletionWidget } from '../mission/MissionCompletionWidget';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, toggleCart, updateQuantity, discountAmount, appliedCoupon, applyCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const FREE_DELIVERY_THRESHOLD = 299;
  const freeDeliveryDiff = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 25;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCode = async (codeToApply: string) => {
    setCouponError('');
    try {
      await applyCoupon(codeToApply);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.response?.data?.error || 'Failed to apply coupon');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      handleApplyCode(couponCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blinkit-bg">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blinkit-green" />
              <h2 className="font-extrabold text-base text-gray-900">My Cart</h2>
              <span className="text-xs text-gray-500 font-semibold">({items.length} items)</span>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Delivery ETA Pill */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blinkit-green shrink-0" />
              <div>
                <div className="text-xs font-black text-blinkit-darkGreen">Delivery in 10 minutes</div>
                <div className="text-[11px] text-gray-600">Superfast dark-store dispatch to your doorstep</div>
              </div>
            </div>

            {/* Free Delivery Threshold Bar */}
            {subtotal > 0 && (
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-extrabold text-gray-900">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blinkit-green" />
                    {freeDeliveryDiff === 0 ? (
                      <span className="text-blinkit-green">You unlocked FREE Delivery! 🎉</span>
                    ) : (
                      <span>Add ₹{freeDeliveryDiff} more for FREE Delivery</span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blinkit-green h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* AI Mission Completion Widget */}
            <MissionCompletionWidget />

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-200" />
                <p className="font-bold text-gray-700">Your cart is empty</p>
                <p className="text-xs text-gray-500">Explore categories or click a Quick Mission to start</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-gray-50 border overflow-hidden shrink-0">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{item.product.name}</h4>
                      <div className="text-[11px] text-gray-500">{item.product.unit}</div>
                      <div className="font-black text-xs text-gray-900 mt-0.5">₹{item.product.price * item.quantity}</div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-blinkit-green text-white rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-blinkit-darkGreen transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-blinkit-darkGreen transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coupon Code Section */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter Coupon (e.g. WELCOME100)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full text-xs uppercase bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 font-bold focus:outline-none focus:border-blinkit-green"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition"
                  >
                    Apply
                  </button>
                </form>

                {/* Predefined Coupon Chips */}
                {!appliedCoupon && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApplyCode('WELCOME100')}
                      className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-amber-100 transition"
                    >
                      Use WELCOME100 (₹100 Off)
                    </button>
                    <button
                      onClick={() => handleApplyCode('MISSION20')}
                      className="bg-green-50 border border-green-200 text-green-900 text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-green-100 transition"
                    >
                      Use MISSION20 (20% Off)
                    </button>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="text-xs text-blinkit-green font-bold flex items-center gap-1 bg-green-50 p-2 rounded-xl border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-blinkit-green" />
                    <span>Coupon "{appliedCoupon}" applied (-₹{discountAmount})</span>
                  </div>
                )}
                {couponError && (
                  <div className="text-xs text-red-600 font-medium">{couponError}</div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bill Breakdown & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
              <div className="text-xs space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-blinkit-green font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-gray-900">
                    {deliveryFee === 0 ? <span className="text-blinkit-green font-black">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className="w-full bg-blinkit-green hover:bg-blinkit-darkGreen text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition active:scale-95"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
