'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartId, discountAmount, toggleCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [driverTip, setDriverTip] = useState<number>(30);

  const [address, setAddress] = useState({
    line1: 'Flat 402, Sunshine Apartments, 4th Block',
    city: 'Bengaluru',
    pincode: '560034',
  });

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 299 ? 0 : 25;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + driverTip);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/orders', {
        cartId,
        address,
        discountAmount,
        driverTip,
        paymentMethod,
      });

      const order = res.data;
      if (typeof window !== 'undefined') localStorage.removeItem('blinkclone_cart_id');
      clearCart();
      toggleCart(false);
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto shadow-sm space-y-3">
        <p className="text-lg text-gray-900 font-black">Your cart is empty</p>
        <p className="text-xs text-gray-500">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blinkit-green text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blinkit-darkGreen transition"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Checkout & Instant Payment</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Form: Address & Payment Selection */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-black text-base text-gray-900">
              <MapPin className="w-5 h-5 text-blinkit-green" />
              Delivery Address (10-Minute Dark Store)
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">Street Address / House No.</label>
                <input
                  type="text"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-900 focus:outline-none focus:border-blinkit-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-900 focus:outline-none focus:border-blinkit-green"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-900 focus:outline-none focus:border-blinkit-green"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-black text-base text-gray-900">
              <CreditCard className="w-5 h-5 text-blinkit-green" />
              Select Payment Method
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                  paymentMethod === 'upi'
                    ? 'border-blinkit-green bg-green-50/80 text-blinkit-darkGreen shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                ⚡ Instant UPI
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                  paymentMethod === 'cod'
                    ? 'border-blinkit-green bg-green-50/80 text-blinkit-darkGreen shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                💵 Cash on Delivery
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                  paymentMethod === 'card'
                    ? 'border-blinkit-green bg-green-50/80 text-blinkit-darkGreen shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                💳 Credit / Debit
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3 text-xs text-blinkit-darkGreen font-bold">
              <CheckCircle2 className="w-4 h-4 text-blinkit-green shrink-0" />
              <span>Simulated Instant Payment (MVP Demo Mode)</span>
            </div>
          </div>

          {/* Delivery Partner Tip Option */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-black text-sm text-gray-900">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              Tip your Delivery Partner
            </div>
            <p className="text-xs text-gray-500 font-medium">100% of the tip goes directly to your delivery executive.</p>

            <div className="flex gap-2">
              {[0, 20, 30, 50].map((tip) => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => setDriverTip(tip)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    driverTip === tip
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tip === 0 ? 'No Tip' : `₹${tip}`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-4">
          <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Order Summary</h3>

          <div className="text-xs space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Items ({items.length})</span>
              <span className="font-bold text-gray-900">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-blinkit-green font-bold">
                <span>Discount Applied</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-gray-900">
                {deliveryFee === 0 ? <span className="text-blinkit-green font-black">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            {driverTip > 0 && (
              <div className="flex justify-between text-gray-700 font-semibold">
                <span>Delivery Partner Tip</span>
                <span>₹{driverTip}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-3">
              <span>To Pay</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-blinkit-green hover:bg-blinkit-darkGreen text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing Order...' : 'Place Order Now'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            100% Safe & Secure Checkout
          </div>
        </div>

      </div>
    </div>
  );
}
