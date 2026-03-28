import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import axios from 'axios';
import toast from 'react-hot-toast';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useAppStore();
  const [isOrdering, setIsOrdering] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleOrder = async () => {
    if (cart.length === 0) return;
    if (!tableNumber.trim()) {
      setError('Lütfen siparişi tamamlamadan önce masa numaranızı giriniz.');
      return;
    }
    
    setError('');
    setIsOrdering(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          note: item.note,
          price: item.product.price,
          selectedExtras: item.selectedExtras
        })),
        totalAmount: cartTotal(),
        tableNumber: `Masa ${tableNumber}`,
        customerName: 'Misafir'
      };
      await axios.post('/api/orders', orderData);
      toast.success('Siparişiniz başarıyla alındı! Hazırlanmaya başlandı.');
      clearCart();
      setTableNumber('');
      onClose();
    } catch (error) {
      toast.error('Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex transform transition-transform duration-300">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-brand-dark">Sepetiniz</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🥗</span>
                </div>
                <p className="text-lg font-medium">Sepetiniz şu an boş.</p>
                <p className="text-sm mt-2">Lezzetli menümüzden ürünler eklemeye başlayın!</p>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.map((item) => {
                  const extrasTotal = item.selectedExtras.reduce((sum, e) => sum + e.price, 0);
                  const itemTotal = (item.product.price + extrasTotal) * item.quantity;

                  return (
                    <li key={item.id} className="flex py-2 bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                      <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-lg object-cover" />
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-bold text-brand-dark">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4 text-brand-orange">{itemTotal.toFixed(2)} ₺</p>
                          </div>
                          {item.selectedExtras.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ekstralar: {item.selectedExtras.map(e => e.name).join(', ')}
                            </p>
                          )}
                          {item.note && <p className="mt-1 text-xs text-gray-400 italic">Not: {item.note}</p>}
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm mt-4">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-gray-200 rounded-l-lg transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="px-3 font-bold text-brand-dark">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-200 rounded-r-lg transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md transition-colors">
                            <Trash2 size={14} /> Sil
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Masa Numaranız <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={tableNumber}
                  onChange={(e) => { setTableNumber(e.target.value); setError(''); }}
                  placeholder="Örn: 12"
                  className={`w-full border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all`}
                />
                {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
              </div>

              <div className="flex justify-between text-xl font-bold text-brand-dark mb-6">
                <p>Genel Toplam</p>
                <p className="text-brand-orange">{cartTotal().toFixed(2)} ₺</p>
              </div>
              <button
                onClick={handleOrder}
                disabled={isOrdering}
                className="w-full bg-brand-green text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all transform active:scale-95 disabled:opacity-70 shadow-lg flex justify-center items-center gap-2"
              >
                {isOrdering ? 'Sipariş İletiliyor...' : 'Siparişi Onayla'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
